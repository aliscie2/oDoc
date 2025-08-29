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
    api_key: String
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


    // Use current Claude 3.5 models
    let model = if quick {
        "claude-3-haiku-20240307"
    } else {
        "claude-3-5-sonnet-20241022"
    };
    // claude-3-5-sonnet-20241022
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
    
    // Add retry logic for consensus errors
    let mut attempts = 0;
    let max_attempts = 3;
    
    let response = loop {
        attempts += 1;
        
        match http_request(request.clone(), cycles).await {
            Ok((response,)) => break response,
            Err(e) => {
                let error_msg = format!("{:?}", e);
                
                // Check if it's a consensus error
                if error_msg.contains("No consensus could be reached") && attempts < max_attempts {
                    ic_cdk::println!("Consensus error on attempt {}, retrying...", attempts);
                    // Small delay before retry (using IC timer)
                    continue;
                } else {
                    return Err(format!("HTTP request failed after {} attempts: {:?}", attempts, e));
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
    // More aggressive transform to ensure consensus
    // Remove ALL headers that could be non-deterministic
    let mut sanitized_headers = Vec::new();
    
    // Only keep absolutely essential headers
    for header in raw.response.headers {
        let header_name = header.name.to_lowercase();
        // Only keep content-type for proper parsing
        if header_name == "content-type" {
            sanitized_headers.push(header);
        }
    }

    // Parse and sanitize the response body to remove non-deterministic fields
    let sanitized_body = if raw.response.status == 200u16 {
        match String::from_utf8(raw.response.body.clone()) {
            Ok(body_str) => {
                match serde_json::from_str::<serde_json::Value>(&body_str) {
                    Ok(mut json) => {
                        // Remove non-deterministic fields from Anthropic API response
                        if let Some(obj) = json.as_object_mut() {
                            obj.remove("id"); // Request ID is non-deterministic
                            obj.remove("created_at"); // Timestamp is non-deterministic
                            
                            // Clean usage object if present
                            if let Some(usage) = obj.get_mut("usage") {
                                if let Some(usage_obj) = usage.as_object_mut() {
                                    // Keep token counts but remove any timestamps or IDs
                                    usage_obj.retain(|k, _| {
                                        k == "input_tokens" || k == "output_tokens" || k == "total_tokens"
                                    });
                                }
                            }
                        }
                        
                        serde_json::to_vec(&json).unwrap_or(raw.response.body)
                    }
                    Err(_) => raw.response.body // Keep original if not valid JSON
                }
            }
            Err(_) => raw.response.body // Keep original if not valid UTF-8
        }
    } else {
        raw.response.body // Keep error responses as-is
    };

    HttpResponse {
        status: raw.response.status,
        body: sanitized_body,
        headers: sanitized_headers,
    }
}
