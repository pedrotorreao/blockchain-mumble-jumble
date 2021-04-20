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

  genesisCreate() {
    return new Block(0, "04,19,2021", "Genesis", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.prevHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calcHash();

    this.chain.push(newBlock);
  }
}

let niceCoin = new Blockchain();

niceCoin.addBlock(new Block(1, "04/19/2021", { balance: 40 }));
niceCoin.addBlock(new Block(2, "04/19/2021", { balance: 5 }));
niceCoin.addBlock(new Block(3, "04/19/2021", { balance: 32 }));

console.log(JSON.stringify(niceCoin, null, 4));
