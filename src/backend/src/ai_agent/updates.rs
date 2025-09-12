use crate::current_user_state::UserState;
use ic_cdk_macros::*;
// Import user history related types and traits
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse, TransformArgs,
    TransformContext,
};
use serde::Serialize;
use serde_json::json;

use candid::{CandidType, Deserialize};

#[derive(PartialOrd, PartialEq, Clone, Debug, Default, Serialize, CandidType, Deserialize)]
pub struct AiResponse {
    pub remaining_credits: f64,
    pub response: String,
}

// Only have this one update function as the public API
#[update]
pub async fn ask_ai(
    prompt: String,
    system_prompt: String,
    quick: bool,
    api_key: String,
) -> Result<AiResponse, String> {
    if !UserState::is_user_exists() {
        return Err("User does not exist".to_string());
    }

    let current_credits = UserState::get_credits();
    if current_credits <= 0.0 {
        return Err("Insufficient credits".to_string());
    }

    let credit_cost = if quick { 0.0001 } else { 0.0005 };
    if current_credits < credit_cost {
        return Err("Insufficient credits for this request".to_string());
    }

    let model = if quick {
        "llama-3.1-8b-instant"
    } else if prompt.split_whitespace().count() > 700 {
        "llama-3.3-70b-versatile"
    } else {
        "llama-3.3-70b-versatile"
    };

    let max_tokens = if quick { 500 } else { 8192 };

    let request_body = json!({
        "model": model,
        "max_tokens": max_tokens,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
    });

    let request_body_bytes = serde_json::to_vec(&request_body)
        .map_err(|e| format!("Failed to serialize request: {}", e))?;

    let request = CanisterHttpRequestArgument {
        url: "https://api.groq.com/openai/v1/chat/completions".to_string(),
        method: HttpMethod::POST,
        body: Some(request_body_bytes),
        max_response_bytes: Some(20_000),
        transform: Some(TransformContext::from_name("transform".to_string(), vec![])),
        headers: vec![
            HttpHeader {
                name: "Content-Type".to_string(),
                value: "application/json".to_string(),
            },
            HttpHeader {
                name: "Authorization".to_string(),
                value: format!("Bearer {}", api_key),
            },
        ],
    };

    let cycles = 230_949_972_000u128;
    let mut attempts = 0;
    let max_attempts = 3;

    let response = loop {
        attempts += 1;
        match http_request(request.clone(), cycles).await {
            Ok((response,)) => break response,
            Err(e) => {
                let error_msg = format!("{:?}", e);
                if error_msg.contains("No consensus could be reached") && attempts < max_attempts {
                    ic_cdk::println!("Consensus error on attempt {}, retrying...", attempts);
                    continue;
                } else {
                    return Err(format!(
                        "HTTP request failed after {} attempts: {:?}",
                        attempts, e
                    ));
                }
            }
        }
    };

    if response.status != 200u16 {
        let error_body = String::from_utf8(response.body.clone())
            .unwrap_or_else(|_| "Unable to parse error response".to_string());
        return Err(format!(
            "API request failed with status: {} - Response: {}",
            response.status, error_body
        ));
    }

    let response_str = String::from_utf8(response.body)
        .map_err(|e| format!("Failed to parse response body: {}", e))?;

    let response_json: serde_json::Value = serde_json::from_str(&response_str)
        .map_err(|e| format!("Failed to parse JSON response: {}", e))?;

    let response_text = response_json
        .get("choices")
        .and_then(|choices| choices.as_array())
        .and_then(|arr| arr.first())
        .and_then(|choice| choice.get("message"))
        .and_then(|message| message.get("content"))
        .and_then(|content| content.as_str())
        .unwrap_or("No response from AI")
        .to_string();

    if let Some(usage) = response_json.get("usage") {
        ic_cdk::println!("Token usage: {:?}", usage);
    }

    let new_credits = current_credits - credit_cost;
    UserState::set_credits(new_credits);

    Ok(AiResponse {
        remaining_credits: new_credits as f64,
        response: response_text,
    })
}

#[query]
fn transform(raw: TransformArgs) -> HttpResponse {
    // Simple transform that removes non-deterministic headers
    // Keep only content-related headers for consensus
    let mut sanitized_headers = Vec::new();
    for header in raw.response.headers {
        let header_name = header.name.to_lowercase();
        // Keep essential headers for API responses
        if header_name.starts_with("content-")
            || header_name == "x-ratelimit-requests-remaining"
            || header_name == "x-ratelimit-tokens-remaining"
        {
            sanitized_headers.push(header);
        }
    }

    HttpResponse {
        status: raw.response.status,
        body: raw.response.body,
        headers: sanitized_headers,
    }
}
