use dep::ecrecover;
use dep::std;

fn main(
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    signature: [u8; 64],
    hashed_message: [u8; 32],
    leading_zeros: pub Field,
    nulifier: pub [u128; 2],
) {
    let address = ecrecover::ecrecover(pub_key_x, pub_key_y, signature, hashed_message);
    let bytesAddr: [u8; 20] = address.to_be_bytes();
    let hashedAddr = std::hash::blake2s(bytesAddr);
    assert(u128s_to_u8s(nulifier) == hashedAddr, "Nulifier does not match the hash of the address");

    let threshold = 2.pow_32(160 - (leading_zeros * 4));
    assert(
        address.lt(threshold),
        f"{address} does not start with {leading_zeros} number of leading zeros",
    );
}

fn u128s_to_u8s(arr: [u128; 2]) -> [u8; 32] {
    let mut out: [u8; 32] = [0; 32];
    for i in 0..2 {
        let val = arr[i as u32];
        for j in 0..16 {
            let shift = 8 * (15 - j);
            out[(i * 16 + j) as u32] = ((val >> shift) & 0xff) as u8;
        }
    }
    out
}
