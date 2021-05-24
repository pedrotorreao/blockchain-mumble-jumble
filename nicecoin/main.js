const { Blockchain, Transaction } = require("./blockchain");
const EC = require("elliptic").ec; // import library
const ec = new EC("secp256k1"); // elliptic curve

const myKey = ec.keyFromPrivate(
  "6b7fbf4cb082d46ed26c44d4518e2f9c2e4023dc47ff94f3358aec0701867b5b"
);
const myWalletAddr = myKey.getPublic("hex");

let niceCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddr, "pubkey of recipient", 25);
tx1.signTransaction(myKey);
niceCoin.addTransaction(tx1);

console.log("\n Starting the miner ...");
niceCoin.minePendingTransactions(myWalletAddr);
niceCoin.minePendingTransactions(myWalletAddr);

console.log(
  "\nMy Wallet Balance is: ",
  niceCoin.getBalanceOfAddress(myWalletAddr)
);

// console.log("\n Starting the miner ...");
// niceCoin.minePendingTransactions("minerONEAddr");

// console.log(
//   "\n Balance of minerONE is ",
//   niceCoin.getBalanceOfAddress("minerONEAddr")
// );

// console.log("NiceCoin - Blockchain: ", JSON.stringify(niceCoin, null, 4));
// console.log("Blockchain is VALID: " + niceCoin.isChainValid());

/* 
Next steps:
- maybe add a method to take the chain back to previous valid state.
- add proof of work.
- implement transactions.
- check for insufficient funds.
*/
