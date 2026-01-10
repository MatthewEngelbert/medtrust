import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
    index: { type: Number, required: true },
    timestamp: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    previousHash: { type: String, required: true },
    hash: { type: String, required: true },
    nonce: { type: Number, required: true }
});

const Block = mongoose.models.Block || mongoose.model('Block', blockSchema);
export default Block;
