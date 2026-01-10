import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import BlockModel from './models/BlockModel.js';
import Block from './blockchain/Block.js';
// import { fileURLToPath } from 'url'; // Removed to avoid Vercel SyntaxError

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- HEALTH CHECK ROUTE (NO DB) ---
app.get('/api/test', (req, res) => {
    res.json({
        status: "OK",
        message: "Server is running!",
        env_check: {
            mongo: !!process.env.MONGO_URI,
            blockchain: !!medTrustChain
        },
        db_state: mongoose.connection.readyState,
        mongo_uri_preview: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 20) + "..." : "MISSING"
    });
});

// --- DB CONNECTION CAHING (SERVERLESS FRIENDLY) ---
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb && mongoose.connection.readyState === 1) {
        return cachedDb;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing");
    }

    // SANITIZE URI (Remove quotes or prefixes if user added them accidentally)
    let mongoUri = process.env.MONGO_URI.trim();

    // Remove leading '=' (Common Vercel copy-pase error)
    if (mongoUri.startsWith('=')) {
        mongoUri = mongoUri.substring(1);
    }

    // Remove "MONGO_URI=" prefix (If user pasted the whole line)
    if (mongoUri.startsWith('MONGO_URI=')) {
        mongoUri = mongoUri.substring('MONGO_URI='.length);
    }

    // Remove quotes
    if (mongoUri.startsWith('"') && mongoUri.endsWith('"')) {
        mongoUri = mongoUri.slice(1, -1);
    }

    console.log("⏳ Connecting to MongoDB...");
    cachedDb = await mongoose.connect(mongoUri, {
        bufferCommands: false, // Disable buffering to fail fast if no connection
        serverSelectionTimeoutMS: 5000 // 5s timeout
    });
    console.log("✅ MongoDB Connected");

    // --- SYNC BLOCKCHAIN FROM DB (ONCE PER COLD START) ---
    try {
        const blocks = await BlockModel.find().sort({ index: 1 });
        if (medTrustChain) {
            if (blocks.length > 0) {
                // Reconstruct Block instances
                medTrustChain.chain = blocks.map(dbBlock => {
                    const blk = new Block(dbBlock.index, dbBlock.timestamp, dbBlock.data, dbBlock.previousHash);
                    blk.hash = dbBlock.hash;
                    blk.nonce = dbBlock.nonce;
                    return blk;
                });
                console.log(`✅ Blockchain loaded from DB: ${blocks.length} blocks`);
            } else {
                // Save Genesis Block if DB is empty
                const genesis = medTrustChain.chain[0];
                await new BlockModel(genesis).save();
                console.log("✅ Genesis Block saved to DB");
            }
        }
    } catch (err) {
        console.error("❌ Blockchain Sync Error:", err);
    }

    try {
        const User = mongoose.models.User || mongoose.model('User');
        await User.syncIndexes();
        console.log("✅ Indexes Synced");
    } catch (error) {
        console.error("⚠️ Index Sync Error:", error);
    }

    return cachedDb;
}

// --- GLOBAL MIDDLEWARE: ENSURE DB CONNECTED ---
app.use(async (req, res, next) => {
    // Skip DB check for test route (optional, but good for debugging isolated crashes)
    if (req.path === '/api/test') return next();

    try {
        await connectToDatabase();
        next();
    } catch (error) {
        console.error("❌ Database Connection Failed:", error);
        res.status(500).json({ message: "Database connection failed", error: error.message });
    }
});



// --- 1. MODEL USER (SCHEMA UPDATE) ---
// Struktur data disesuaikan dengan gambar profil MedTrust
const userSchema = new mongoose.Schema({
    // Wajib diisi saat daftar (Credentials)
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor'], default: 'patient' },

    // Data Profil Tambahan (Boleh kosong dulu / required: false)
    fullName: { type: String, required: false },
    age: { type: Number, required: false },
    domicile: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    address: { type: String, required: false },

    // Khusus Dokter
    specialization: { type: String },
    licenseNumber: { type: String },
    hospital: { type: String },

    // ID Unik Berdasarkan Role
    patientId: { type: String, unique: true, sparse: true }, // sparse: true agar null tidak dianggap duplikat
    doctorId: { type: String, unique: true, sparse: true }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// --- JALANKAN SERVER ---
const router = express.Router();

// --- 2. ROUTE SIGN UP (DAFTAR) ---
router.post('/signup', async (req, res) => {
    try {
        // Ambil semua data dari frontend
        const {
            username,
            email,
            password,
            fullName,
            age,
            domicile,
            phoneNumber,
            address,
            role, // 'patient' or 'doctor'
            specialization,
            licenseNumber,
            hospital
        } = req.body;

        // Cek email ganda
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah terdaftar!" });
        }

        // Enkripsi password
        const hashedPassword = await bcrypt.hash(password, 10);

        // GENERATE UNIQUE ID LOOP
        let generatedId = "";
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 5) {
            const randomNumbers = Math.floor(100000 + Math.random() * 900000);
            if (role === 'doctor') {
                generatedId = `DR#${randomNumbers}`;
            } else {
                generatedId = `#${randomNumbers}`;
            }

            // Check if ID exists in DB
            const existingIdUser = await User.findOne(role === 'doctor' ? { doctorId: generatedId } : { patientId: generatedId });

            if (!existingIdUser) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            return res.status(500).json({ message: "Gagal membuat ID unik, silakan coba lagi." });
        }

        // Setup user payload
        const userPayload = {
            username,
            email,
            password: hashedPassword,
            fullName,
            phoneNumber,
            address,
            role: role || 'patient'
        };

        if (role === 'doctor') {
            userPayload.doctorId = generatedId;
            userPayload.specialization = specialization;
            userPayload.licenseNumber = licenseNumber;
            userPayload.hospital = hospital;
        } else {
            userPayload.patientId = generatedId;
            userPayload.age = age;
            userPayload.domicile = domicile;
        }

        // Masukkan data ke database
        const newUser = new User(userPayload);
        await newUser.save();

        res.status(201).json({
            message: "User berhasil dibuat!",
            id: generatedId
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
});

// --- 3. ROUTE SIGN IN (LOGIN) ---
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User tidak ditemukan" });
        }

        // Cek password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password salah!" });
        }

        // Login sukses -> Kirim data user ke frontend untuk ditampilkan di Profile
        res.json({
            message: "Login berhasil!",
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                id: user.role === 'doctor' ? user.doctorId : user.patientId,
                fullName: user.fullName,
                age: user.age,
                domicile: user.domicile,
                phoneNumber: user.phoneNumber,
                address: user.address,
                specialization: user.specialization,
                hospital: user.hospital
            }
        });

    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan server", error: error.message, stack: error.stack });
    }
});

// --- 4. ROUTE UPDATE PROFILE ---
router.put('/update-profile', async (req, res) => {
    try {
        const { email, name, age, domicile, phone, address, specialisation, licenseNumber, hospital } = req.body;

        // Cari user berdasarkan email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Update data
        // Map frontend 'name' ke backend 'username' & 'fullName'
        if (name) {
            user.username = name;
            user.fullName = name;
        }
        if (age) user.age = age;
        if (domicile) user.domicile = domicile;
        if (phone) user.phoneNumber = phone; // Map 'phone' ke 'phoneNumber'
        if (address) user.address = address;

        // Update dokter spesifik
        if (user.role === 'doctor') {
            if (specialisation) user.specialization = specialisation;
            if (licenseNumber) user.licenseNumber = licenseNumber;
            if (hospital) user.hospital = hospital;
        }

        await user.save();

        res.json({
            message: "Profile berhasil diupdate!",
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                id: user.role === 'doctor' ? user.doctorId : user.patientId,
                fullName: user.fullName,
                age: user.age,
                domicile: user.domicile,
                phoneNumber: user.phoneNumber,
                address: user.address,
                specialization: user.specialization,
                licenseNumber: user.licenseNumber,
                hospital: user.hospital
            }
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Gagal mengupdate profile" });
    }
});

// --- 4.5 ROUTE SEARCH PATIENTS ---
router.get('/patients/search', async (req, res) => {
    try {
        const { query } = req.query;

        let searchCriteria = { role: 'patient' };

        if (query) {
            const regex = new RegExp(query, 'i');
            searchCriteria.$or = [
                { username: regex },
                { fullName: regex },
                { patientId: regex }
            ];
        }

        const patients = await User.find(searchCriteria)
            .select('username fullName patientId age domicile email')
            .sort({ _id: -1 }) // Show newest first
            .limit(20); // Limit to 20 for now

        res.json(patients);

    } catch (error) {
        console.error("Search Patient Error:", error);
        res.status(500).json({ message: "Gagal mencari pasien" });
    }
});

// --- 5. BLOCKCHAIN API ---
import Blockchain from './blockchain/Blockchain.js';
let medTrustChain = null;
try {
    medTrustChain = new Blockchain();
    console.log("✅ Blockchain Initialized");
} catch (e) {
    console.error("❌ Failed to initialize Blockchain:", e);
}

router.get('/chain', (req, res) => {
    if (!medTrustChain) return res.status(500).json({ message: "Blockchain failed to initialize" });
    res.json(medTrustChain);
});

// POST /mine - Tambah blok baru (Record Medis)
router.post('/mine', async (req, res) => {
    if (!medTrustChain) return res.status(500).json({ message: "Blockchain failed to initialize" });
    // Expecting the full block object from client
    const { index, timestamp, data, previousHash, hash, nonce } = req.body;

    // Basic Validation
    if (index === undefined || !timestamp || !data || !hash || nonce === undefined) {
        return res.status(400).json({ message: "Invalid block data" });
    }

    // Server-side Verification
    const latestBlock = medTrustChain.getLatestBlock();

    if (previousHash !== latestBlock.hash) {
        return res.status(400).json({ message: "Block rejected: Previous hash mismatch. Please refresh chain." });
    }

    const newBlock = {
        index,
        timestamp,
        data,
        previousHash,
        hash,
        nonce
    };

    medTrustChain.chain.push(newBlock);

    // Save to Persistence
    try {
        await new BlockModel(newBlock).save();
        console.log("✅ Block persisted to DB");
    } catch (dbErr) {
        console.error("❌ Failed to save block to DB:", dbErr);
    }

    console.log(`✅ Block #${index} accepted from client! Hash: ${hash}`);

    res.json({
        message: "Block accepted and added to chain",
        block: newBlock
    });
});

// Mount Routes
app.use('/api', router); // For Vercel (/api/...)
app.use('/', router);    // For Localhost (/)

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
    app.listen(PORT, () => console.log(`🚀 Server berjalan di port ${PORT}`));
}

export default app;