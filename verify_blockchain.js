import Blockchain from './src/lib/blockchain/Blockchain.js';
import Block from './src/lib/blockchain/Block.js';

// Mocking console.log to keep output clean or just letting it run
const chain = new Blockchain();

console.log("Mining Block 1...");
const b1 = new Block(1, new Date().toISOString(), { amount: 4 }, chain.getLatestBlock().hash);
b1.mineBlock(2);
chain.addBlock(b1);

console.log("Mining Block 2...");
const b2 = new Block(2, new Date().toISOString(), { amount: 10 }, chain.getLatestBlock().hash);
b2.mineBlock(2);
chain.addBlock(b2);

console.log("Is chain valid? " + chain.isChainValid());

// Tampering
console.log("Tampering with Block 1...");
chain.chain[1].data = { amount: 100 };
console.log("Is chain valid after tampering? " + chain.isChainValid());
