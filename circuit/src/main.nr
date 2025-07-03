// use dep::ecrecover;
use dep::std;

// fn main(
//     pub_key_x: [u8; 32],
//     pub_key_y: [u8; 32],
//     signature: [u8; 64],
//     hashed_message: [u8; 32],
//     // leading_zeros: pub Field,
// ) {
//     // let address = ecrecover::ecrecover(pub_key_x, pub_key_y, signature, hashed_message);
//     let verified =
//         std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, hashed_message);

//     assert(verified)
// }

fn main(
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    signature: [u8; 64],
    hashed_message: [u8; 32],
    leading_zeros: pub Field,
) {
    let address = ecrecover::ecrecover(pub_key_x, pub_key_y, signature, hashed_message);
    std::println(address);

    let address_bits: [u1; 160] = address.to_be_bits();
    // for i in 0..(leading_zeros * 4) {
    //     assert(
    //         address_bits[i as u32] == 0,
    //         "Address does not start with enough leading zeros",
    //     );
    // }
    // assert(address >> (160 - (leading_zeros * 4)) == 0);

    if leading_zeros == 1 {
        for i in 0..4 {
            assert(address_bits[i] == 0, "Address does not have 1 leading zero");
        }
    } else if leading_zeros == 2 {
        for i in 0..8 {
            assert(address_bits[i] == 0, "Address does not have 2 leading zeros");
        }
    } else if leading_zeros == 3 {
        for i in 0..12 {
            assert(address_bits[i] == 0, "Address does not have 3 leading zeros");
        }
    } else if leading_zeros == 4 {
        for i in 0..16 {
            assert(address_bits[i] == 0, "Address does not have 4 leading zeros");
        }
    } else if leading_zeros == 5 {
        for i in 0..20 {
            assert(address_bits[i] == 0, "Address does not have 5 leading zeros");
        }
    } else if leading_zeros == 6 {
        for i in 0..24 {
            assert(address_bits[i] == 0, "Address does not have 6 leading zeros");
        }
    } else if leading_zeros == 7 {
        for i in 0..28 {
            assert(address_bits[i] == 0, "Address does not have 7 leading zeros");
        }
    } else if leading_zeros == 8 {
        for i in 0..32 {
            assert(address_bits[i] == 0, "Address does not have 8 leading zeros");
        }
    } else if leading_zeros == 9 {
        for i in 0..36 {
            assert(address_bits[i] == 0, "Address does not have 9 leading zeros");
        }
    } else if leading_zeros == 10 {
        for i in 0..40 {
            assert(address_bits[i] == 0, "Address does not have 10 leading zeros");
        }
    } else {
        assert(false, "Unsupported number of leading zeros");
    }
}

// fn main(address: Field, leading_zeros: u8) {
//     // let address_bits: [u1; 160] = address.to_be_bits();
//     // for i in 0..(3 * 4) {
//     //     assert(address_bits[i] == 0, "Address does not start with 3 leading zeros");
//     // }

//     // let threshold = 2.pow_32(160 - (3 * 4));
//     // std::println(address);
//     // std::println(threshold);
//     // std::println(address.div(threshold));
//     // assert(address.div(threshold) == 0, "Address does not start with 3 leading zeros");

//     let address_bits: [u1; 160] = address.to_be_bits();
//     if leading_zeros == 1 {
//         for i in 0..4 {
//             assert(address_bits[i] == 0, "Address does not have 1 leading zero");
//         }
//     } else if leading_zeros == 2 {
//         for i in 0..8 {
//             assert(address_bits[i] == 0, "Address does not have 2 leading zeros");
//         }
//     } else if leading_zeros == 3 {
//         for i in 0..12 {
//             assert(address_bits[i] == 0, "Address does not have 3 leading zeros");
//         }
//     } else if leading_zeros == 4 {
//         for i in 0..16 {
//             assert(address_bits[i] == 0, "Address does not have 4 leading zeros");
//         }
//     }
// }

// #[test]
// fn test_main() {
// 0x06bad807A82dc97057D02836098a3587317eC205
// main(38420702091155604025130733662307539288453988869);

// main(0x000ad807A82dc97057D02836098a3587317eC205, 3);

// 0x00aad807A82dc97057D02836098a3587317eC205
// main(3809945543036076909467298903157282231172383237)
// }
