use super::base64url::decode_b64::{decodificar_json_base64, decodificar_signature};
use super::sha256::sha256::hash_sha256;
use super::structs::Header;
use serde_json::{from_value, Value};

use super::rsa::decrypt_rsa::decrypt;

pub fn read_jwt(jwt: &str) -> Result<String, String> {

    let parts: Vec<&str> = jwt.split('.').collect();
    if parts.len() != 3 {
        return Err("Invalid JWT format".into());
    }
    let (header_b64, payload_b64, signature_b64) = (parts[0], parts[1], parts[2]);

    let payload_value: Value = decodificar_json_base64(payload_b64)
        .map_err(|e| e.to_string())?;

    let header_value: Value = decodificar_json_base64(header_b64)
        .map_err(|e| e.to_string())?;

    let header_json: Header = from_value(header_value.clone())
        .map_err(|e| e.to_string())?;

    let signature_rsa = decodificar_signature(signature_b64)
        .map_err(|e| e.to_string())?;

    let signature = decrypt(&signature_rsa, header_json.n, header_json.e);

    let signing_input = format!("{}.{}", header_b64, payload_b64);

    let computed_signature =
        hash_sha256(&signing_input);

    if signature != computed_signature {
        return Err("Invalid JWT signature".into());
    }

    Ok(payload_value.to_string())
}