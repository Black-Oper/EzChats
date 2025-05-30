use rand::rng;

fn mdc(a: u64, b: u64) -> u64 {
    if b == 0 {
        return a;
    }
    mdc(b, a % b)
}

fn is_prime(n: u64) -> bool {
    if n < 2 {
        return false;
    }
    if n == 2 {
        return true;
    }
    if n % 2 == 0 {
        return false;
    }
    let lim = (n as f64).sqrt() as u64;
    let mut i = 3;
    while i <= lim {
        if n % i == 0 {
            return false;
        }
        i += 2;
    }
    true
}

fn random_prime(min: u64, max: u64) -> u64 {
    let mut rng = rng();
    loop {
        let cand = rand::Rng::random_range(&mut rng, min..=max);
        if is_prime(cand) {
            return cand;
        }
    }
}

fn extended_gcd(a: i64, b: i64) -> (i64, i64, i64) {
    if a == 0 {
        return (b, 0, 1);
    }
    let (g, x1, y1) = extended_gcd(b % a, a);
    let x = y1 - (b / a) * x1;
    let y = x1;
    (g, x, y)
}

fn mod_inverse(e: u64, phin: u64) -> Option<u64> {
    let e_i64 = e as i64;
    let phin_i64 = phin as i64;


    let (g, x, _) = extended_gcd(e_i64, phin_i64);
    if g != 1 {
        None
    } else {
        let result = (x % phin_i64 + phin_i64) % phin_i64;
        Some(result as u64)
    }
}


fn generate_e(phin: u64) -> u64 {
    let common_es = [65537, 257, 17, 5, 3];
    for &e_candidate in &common_es {

        if e_candidate < phin && mdc(e_candidate, phin) == 1 {
            return e_candidate;
        }
    }

    let mut e = 3;
    while e < phin {
        if mdc(e, phin) == 1 {
            return e;
        }
        e += 2;
    }

    panic!("Não encontrou o e...");
}

fn generate_d(e: u64, phin: u64) -> u64 {
    match mod_inverse(e, phin) {
        Some(d_val) => d_val,
        None => panic!("Não encontrou o d (o inverso multiplicativo modular não existe ou e/phin muito grandes para i64)"),
    }
}

pub fn generate_keys() -> [u64; 3] {
    let p = random_prime(500_000, 10_000_000);
    let mut q: u64;

    loop {
        q = random_prime(500_000, 10_000_000);
        if p != q {
            break;
        }
    }

    let n = p * q;
    let phin = (p - 1) * (q - 1);

    let e = generate_e(phin);
    let d = generate_d(e, phin);

    let keys: [u64; 3] = [n, e, d];
    keys
}