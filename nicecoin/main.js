const SHA256 = require("crypto-js/sha256");

class Block {
  constructor(idx, timeStamp, data, prevHash = "") {
    this.idx = idx;
    this.timeStamp = timeStamp;
    this.data = data;
    this.prevHash = prevHash;
    this.hash = this.calcHash();
  }

  calcHash() {
    return SHA256(
      this.idx + this.prevHash + this.timeStamp + JSON.stringify(this.data)
    ).toString();
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.genesisCreate()];
  }

  /**
   * This method creates and initializes the blockchain.
   * @returns {Object} First block in the chain. No prevHash.
   */
  genesisCreate() {
    return new Block(0, "04,19,2021", "Genesis", "0");
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
   * @param {Object} newBlock Object representative of a single block.
   */
  addBlock(newBlock) {
    newBlock.prevHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calcHash();

    this.chain.push(newBlock);
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

niceCoin.addBlock(new Block(1, "04/19/2021", { balance: 40 }));
niceCoin.addBlock(new Block(2, "04/19/2021", { balance: 5 }));
niceCoin.addBlock(new Block(3, "04/19/2021", { balance: 32 }));

console.log(JSON.stringify(niceCoin, null, 4));

console.log("Blockchain is VALID: " + niceCoin.isChainValid()); // Expected output: TRUE

niceCoin.chain[1].data = { amount: 50 }; //Alter the data property

console.log("Blockchain is VALID: " + niceCoin.isChainValid()); // Expected output: FALSE

niceCoin.chain[1].hash = niceCoin.chain[1].calcHash(); // Try to fix the broken chain by recalculating the hash value

console.log("Blockchain is VALID: " + niceCoin.isChainValid()); // Expected output: FALSE. Hash value might be right, but the next block will still have the link to previous block broken.

console.log(JSON.stringify(niceCoin, null, 4));

/* 
Next steps:
- maybe add a method to take the chain back to previous valid state.
- add proof of work.
- implement transactions.
- check for insufficient funds.
*/
