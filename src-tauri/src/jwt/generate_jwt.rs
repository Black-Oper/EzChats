use super::base64url::encode_b64::converter_json_base64;
use super::rsa::encrypt_rsa::encrypt;

use super::structs::ChatMessage;
use super::structs::Header;

use super::sha256::sha256::hash_sha256;

pub fn generate_jwt(
    payload: &ChatMessage,
    n: &u64,
    e: &u64,
    d: &u64,
) -> Result<String, String> {

    let header = Header {
        alg: "RS256".to_string(),
        typ: "JWT".to_string(),
        n: n.clone(),
        e: e.clone(),
    };

    let header_json = serde_json::to_string(&header).map_err(|e| e.to_string())?;
    let header_b64 = converter_json_base64(&header_json);

    let payload_json = serde_json::to_string(&payload).map_err(|e| e.to_string())?;
    let payload_b64 = converter_json_base64(&payload_json);

    let signature = format!("{}.{}", header_b64, payload_b64);

    let signature = hash_sha256(&signature);

    println!("Signature: {}", signature);

    let signature_rsa = encrypt(signature.as_bytes(), &n, &d);

    println!("Signature RSA: {}", signature_rsa);

    let signature_b64 = converter_json_base64(&signature_rsa);

    Ok(format!("{}.{}.{}", header_b64, payload_b64, signature_b64))
}