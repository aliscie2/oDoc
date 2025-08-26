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
) -> Result<AiResponse, String> {
    // Check if user exists and has credits
    if !UserState::is_user_exists() {
        return Err("User does not exist".to_string());
    }

    let current_credits = UserState::get_credits();
    if current_credits <= 0.0 {
        return Err("Insufficient credits".to_string());
    }

    // Deduct credits based on request type
    let credit_cost = if quick { 0.0001 } else { 0.0005 };
    if current_credits < credit_cost {
        return Err("Insufficient credits for this request".to_string());
    }

    // HTTP request to Claude using IC HTTP outcalls
    // TODO: Move API key to environment variables or canister state for security
    let api_key = std::env::var("ANTHROPIC_API_KEY")
        .unwrap_or_else(|_| "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".to_string());

    // Use current Claude 3.5 models
    let model = if quick {
        "claude-3-5-haiku-20241022"
    } else {
        "claude-3-5-sonnet-20241022"
    };
    let max_tokens = if quick { 1000 } else { 4000 };

    // Build request body according to Anthropic API spec
    let request_body = json!({
        "model": model,
        "max_tokens": max_tokens,
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    });

    let request_body_bytes = serde_json::to_vec(&request_body)
        .map_err(|e| format!("Failed to serialize request: {}", e))?;

    let request = CanisterHttpRequestArgument {
        url: "https://api.anthropic.com/v1/messages".to_string(),
        method: HttpMethod::POST,
        body: Some(request_body_bytes),
        max_response_bytes: Some(20_000), // Increased for longer responses
        transform: Some(TransformContext::from_name("transform".to_string(), vec![])),
        headers: vec![
            HttpHeader {
                name: "Content-Type".to_string(),
                value: "application/json".to_string(),
            },
            HttpHeader {
                name: "x-api-key".to_string(),
                value: api_key,
            },
            HttpHeader {
                name: "anthropic-version".to_string(),
                value: "2023-06-01".to_string(), // Current stable version
            },
        ],
    };

    let cycles = 230_949_972_000u128;
    let (response,): (HttpResponse,) = http_request(request, cycles)
        .await
        .map_err(|e| format!("HTTP request failed: {:?}", e))?;

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

    // Parse response according to Anthropic API format
    let response_text = response_json
        .get("content")
        .and_then(|content| content.as_array())
        .and_then(|arr| arr.first())
        .and_then(|first_content| first_content.get("text"))
        .and_then(|text| text.as_str())
        .unwrap_or("No response from AI")
        .to_string();

    // Log usage for debugging (optional)
    if let Some(usage) = response_json.get("usage") {
        ic_cdk::println!("Token usage: {:?}", usage);
    }

    // Deduct credits after successful response
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
