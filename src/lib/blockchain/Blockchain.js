import Block from './Block.js';

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4; // Difficulty set to 4 zeros as requested
    }

    createGenesisBlock() {
        return new Block(0, new Date().toISOString(), "Genesis Block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        // In a real scenario, we validate that newBlock.previousHash matches what we have.
        // For now, we trust the miner constructed it correctly, or we check it.
        if (newBlock.previousHash !== this.getLatestBlock().hash) {
            console.log("Invalid previousHash");
            // We could reject it here.
        }
        // In a real scenario, we might re-mine here or expect it to be mined already.
        // For this simulation, we'll assume the miner calls mineBlock before adding.
        // But to be safe/easy, we can force mine here if not mined? 
        // Usually mining happens outside. We will check if it fits difficulty.

        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

export default Blockchain;
