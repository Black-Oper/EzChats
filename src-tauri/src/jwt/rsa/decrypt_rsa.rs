use std::str;
use std::num::ParseIntError;

fn mod_pow(mut base: u128, mut exp: u64, modulus: u128) -> u128 {
    let mut result = 1u128;
    base %= modulus;
    while exp > 0 {
        if exp & 1 == 1 {
            result = (result * base) % modulus;
        }
        base = (base * base) % modulus;
        exp >>= 1;
    }
    result
}

fn rsa_to_msg(cipher: &[u64], n: u64, e: u64) -> Vec<u8> {
    cipher
        .iter()
        .map(|&c| {
            let decrypted = mod_pow(c as u128, e, n as u128);
            decrypted as u8
        })
        .collect()
}

fn bytes_to_str(bytes: &[u8]) -> String {
    String::from_utf8(bytes.to_vec())
        .unwrap_or_else(|e| {
            eprintln!("Erro ao converter bytes para UTF‑8: {}", e);
            String::new()
        })
}

fn string_to_u64_vec(s: &str) -> Result<Vec<u64>, ParseIntError> {
    s.split_whitespace()
        .map(|sub| sub.parse::<u64>())
        .collect()
}

pub fn decrypt(input: &str, n: u64, e: u64) -> String{

    let arr = string_to_u64_vec(input)
        .unwrap_or_else(|e| {
            eprintln!("Erro ao converter string para vetor de u64: {}", e);
            vec![]
        });

    let msg_bytes = rsa_to_msg(&arr, n, e);

    bytes_to_str(&msg_bytes)
}