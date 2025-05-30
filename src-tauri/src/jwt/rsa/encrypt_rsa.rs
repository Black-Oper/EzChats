fn msg_to_rsa(msg: &[u8], n: &u64, d: &u64) -> Vec<u64> {
    let mut cypher_msg = vec![0u64; msg.len()];

    for i in 0..msg.len() {
        let m_byte = msg[i] as u64;
        cypher_msg[i] = power_mod(m_byte, *d, *n);
    }

    cypher_msg
}

fn concatenate_numbers(numbers: &[u64]) -> String {
    numbers.iter()
        .map(|&num| num.to_string())
        .collect::<Vec<String>>()
        .join(" ")
}


fn power_mod(base: u64, mut exp: u64, modulus: u64) -> u64 {
    let mut res: u128 = 1;
    let mut base_mod: u128 = base as u128 % modulus as u128;

    if modulus == 1 {
        return 0;
    }

    while exp > 0 {
        if exp % 2 == 1 {
            res = (res * base_mod) % (modulus as u128);
        }

        exp = exp >> 1;
        base_mod = (base_mod * base_mod) % (modulus as u128); // Quadrado da base
    }
    res as u64
}

pub fn encrypt(input: &[u8], n: &u64, d: &u64) -> String {

    let cypher_numbers = msg_to_rsa(input, &n, &d);

    concatenate_numbers(&cypher_numbers)
}