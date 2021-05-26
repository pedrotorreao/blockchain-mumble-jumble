const { sign } = require("crypto");
const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec; // import library
const ec = new EC("secp256k1"); // elliptic curve

class Transaction {
  constructor(fromAddr, toAddr, amount) {
    this.fromAddr = fromAddr;
    this.toAddr = toAddr;
    this.amount = amount;
  }

  /**
   * This method uses some of the Transaction properties as input
   * to the SHA256 hashing algorithm in order to calculate
   * a hash value for the transaction.
   * @returns {string} The hash value calculated.
   */
  calcHash() {
    return SHA256(this.fromAddr + this.toAddr + this.amount).toString();
  }

  /**
   * Method for signing transactions. It verifies the validity of the
   * signing key to be used and, if it belongs to the wallet trying
   * to sign the transation, it is a valid transaction and that gets
   * signed.
   * @param {string} signingKey wallet key for signing transactions
   */
  signTransaction(signingKey) {
    // verifies the validity of the signing key:
    if (signingKey.getPublic("hex") !== this.fromAddr) {
      throw new Error("You cannot sign transactions for other wallets!");
    }
    // calucate the hash for the current transaction:
    const hashTx = this.calcHash();
    // sign transaction:
    const signTx = signingKey.sign(hashTx, "base64");

    this.signature = signTx.toDER("hex");
  }

  isValid() {
    // "null" indicates that the transaction is a mining reward:
    if (this.fromAddr === null) {
      return true;
    }
    // "verifies if the transaction is signed:
    if (!this.signature || this.signature.length === 0) {
      throw new Error("There is no signature in this transaction");
    }
    // get the pub key:
    const publicKey = ec.keyFromPublic(this.fromAddr, "hex");
    // verifies that keys match:
    return publicKey.verify(this.calcHash(), this.signature);
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

  /**
   * This method verifies if all the transaction on the block are valid.
   * @returns boolean
   */
  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
      return true;
    }
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

    // reset the pending transactions array and create a new
    // transaction to give the miner its reward:
    this.pendingTransactions = [
      new Transaction(null, miningRewardAddr, this.miningReward)
    ];
  }

  /**
   * Add a new transaction to the pending transactions list.
   * @param {Object} transaction transaction data to be processed.
   */
  addTransaction(transaction) {
    if (!transaction.fromAddr || !transaction.toAddr) {
      throw new Error("Transaction must include from and to addresses!");
    }

    if (!transaction.isValid()) {
      throw new Error("Invalid transactions cannot be added to the chain!");
    }

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

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

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

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
