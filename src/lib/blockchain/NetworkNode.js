import Blockchain from './Blockchain.js';
import Block from './Block.js';

class NetworkNode {
    constructor(id, networkCallback) {
        this.id = id;
        this.chain = new Blockchain();
        this.networkCallback = networkCallback; // Function to broadcast to other nodes
        this.logs = [];
    }

    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.unshift(`[${timestamp}] Node ${this.id}: ${message}`);
        // Keep log size manageable
        if (this.logs.length > 50) this.logs.pop();
    }

    // Simulation of "GET /chain"
    getChain() {
        return this.chain;
    }

    // Simulation of "POST /mine"
    mine(data) {
        this.log("Starting mining process...");
        const newBlock = new Block(
            this.chain.chain.length,
            new Date().toISOString(),
            data,
            this.chain.getLatestBlock().hash
        );

        // Mine the block
        newBlock.mineBlock(this.chain.difficulty);
        this.chain.addBlock(newBlock);
        this.log(`Block #${newBlock.index} mined successfully. Hash: ${newBlock.hash.substring(0, 10)}...`);

        // Broadcast to network
        this.broadcastBlock(newBlock);
        return newBlock;
    }

    broadcastBlock(block) {
        this.log("Broadcasting block to network...");
        if (this.networkCallback) {
            this.networkCallback(this.id, block);
        }
    }

    // Simulation of receiving a block from another node (P2P Gossip)
    receiveBlock(block) {
        // Validate the block roughly (in real life, strict validation)
        const latestBlock = this.chain.getLatestBlock();

        if (block.index <= latestBlock.index) {
            this.log(`Ignored block #${block.index} (already have this or newer).`);
            return;
        }

        if (block.previousHash !== latestBlock.hash) {
            this.log(`Block #${block.index} rejected. Previous hash mismatch.`);
            // In real P2P, we would trigger a full chain sync here.
            return;
        }

        // Re-construct block object to ensure method availability if passed as JSON
        // (Simulating JSON over wire)
        const newBlock = new Block(
            block.index,
            block.timestamp,
            block.data,
            block.previousHash
        );
        newBlock.hash = block.hash;
        newBlock.nonce = block.nonce;

        this.chain.chain.push(newBlock);
        this.log(`Verified and added Block #${block.index} from network.`);
    }
}

export default NetworkNode;
