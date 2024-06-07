// Import the necessary libraries
const { secp256k1 } = require("ethereum-cryptography/secp256k1"); // For elliptic curve cryptography
const { toHex } = require("ethereum-cryptography/utils"); // For converting to hexadecimal
const { keccak256 } = require("ethereum-cryptography/keccak"); // For hashing

// Generate a random private key using secp256k1
const privateKey = secp256k1.utils.randomPrivateKey();

// Generate the corresponding public key
const publicKey = secp256k1.getPublicKey(privateKey);

// Generate the Ethereum address by hashing the public key, slicing off the first byte,
// taking the last 20 bytes, and converting to hexadecimal with a "0x" prefix
const ethAddress = "0x" + toHex(keccak256(publicKey.slice(1)).slice(-20));

// Log the private key, public key, and Ethereum address
console.log("private key: ", toHex(privateKey));
console.log("public key: ", toHex(publicKey));
console.log("eth address: ", ethAddress);
