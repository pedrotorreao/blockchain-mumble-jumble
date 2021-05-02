const SHA256 = require("crypto-js/sha256");

class Transaction {
  constructor(fromAddr, toAddr, amount) {
    this.fromAddr = fromAddr;
    this.toAddr = toAddr;
    this.amount = amount;
  }
}
class Block {
  constructor(timeStamp, transactions, prevHash = "") {
    this.timeStamp = timeStamp;
    this.transactions = transactions;
    this.prevHash = prevHash;
    this.hash = this.calcHash();
    this.nonce = 0;
  }

  /**
   * This method uses some of the Block properties as input
   * to the SHA256 hashing algorithm in order to calculate
   * the hash value for the block.
   * @returns {string} The hash value calculated.
   */
  calcHash() {
    return SHA256(
      this.prevHash +
        this.timeStamp +
        this.nonce +
        JSON.stringify(this.transactions)
    ).toString();
  }

  /**
   * This method implements a simple proof of work requirement by
   * adding the need to perform a "computer intensive" calculation
   * before adding a new block to the blockchain in order to improve
   * security by avoiding the spamming of the blockchain.
   * @param {number} difficulty Intensity of the computer processing
   * power needed to mine a new block.
   */
  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("f")
    ) {
      this.nonce++; // makes sure that the hash changes every iteration.
      this.hash = this.calcHash();
    }

    console.log("Block mined: " + this.hash + "\n");
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.genesisCreate()];
    this.difficulty = 3;
    this.pendingTransactions = [];
    this.miningReward = 50;
  }

  /**
   * This method creates and initializes the blockchain.
   * @returns {Object} First block in the chain. No prevHash.
   */
  genesisCreate() {
    return new Block(Date.now(), "Genesis", "0");
  }

  /**
   * This method returns the block at the end of the chain.
   * @returns {Object} Last element in the chain.
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * This method adds a new block to the chain.
   * @param {String} miningRewardAddr address to where the mining reward
   * is sent after a new block is mined and added to the blockchain.
   */
  minePendingTransactions(miningRewardAddr) {
    let newBlock = new Block(Date.now(), this.pendingTransactions);
    newBlock.prevHash = this.getLatestBlock().hash;

    newBlock.mineBlock(this.difficulty);

    console.log("Block successfully mined!");
    this.chain.push(newBlock);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddr, this.miningReward)
    ];
  }

  /**
   * Add a new transaction to the pending transactions list.
   * @param {Object} transaction transaction data to be processed.
   */
  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  /**
   * Method which calculates the balance of a specified address based on its past transactions.
   * @param {String} addr address for which the balance will be calculated.
   * @returns the calculated balance
   */
  getBalanceOfAddress(addr) {
    let balance = 0;

    for (const block of this.chain) {
      for (const transac of block.transactions) {
        if (transac.fromAddr === addr) {
          balance -= transac.amount;
        }
        if (transac.toAddr === addr) {
          balance += transac.amount;
        }
      }
    }

    return balance;
  }

  /**
   * This method verifies if the blockchain is valid.
   * @returns {boolean} TRUE: Valid, FALSE: Invalid
   */
  isChainValid() {
    for (let index = 1; index < this.chain.length; index++) {
      const currentBlock = this.chain[index];
      const previousBlock = this.chain[index - 1];

      if (
        currentBlock.prevHash !== previousBlock.hash ||
        currentBlock.hash !== currentBlock.calcHash()
      ) {
        return false;
      }
    }
    return true;
  }
}

let niceCoin = new Blockchain();

niceCoin.createTransaction(
  new Transaction("pubKeyWallet1", "pubKeyWallet2", 100)
);
niceCoin.createTransaction(
  new Transaction("pubKeyWallet2", "pubKeyWallet3", 60)
);
niceCoin.createTransaction(
  new Transaction("pubKeyWallet3", "pubKeyWallet1", 10)
);

console.log("\n Starting the miner ...");
niceCoin.minePendingTransactions("minerONEAddr");

console.log(
  "\n Balance of minerONE is ",
  niceCoin.getBalanceOfAddress("minerONEAddr")
);

console.log("\n Starting the miner ...");
niceCoin.minePendingTransactions("minerONEAddr");

console.log(
  "\n Balance of minerONE is ",
  niceCoin.getBalanceOfAddress("minerONEAddr")
);

console.log("NiceCoin - Blockchain: ", JSON.stringify(niceCoin, null, 4));
console.log("Blockchain is VALID: " + niceCoin.isChainValid());

/* 
Next steps:
- maybe add a method to take the chain back to previous valid state.
- add proof of work.
- implement transactions.
- check for insufficient funds.
*/
