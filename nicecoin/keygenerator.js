const EC = require("elliptic").ec; // import library
const ec = new EC("secp256k1"); // elliptic curve

const key = ec.genKeyPair();
const publicKey = key.getPublic("hex");
const privateKey = key.getPrivate("hex");

console.log("\n--PRIVATE KEY: ", privateKey);
console.log("\n--PUBLIC KEY: ", publicKey);
