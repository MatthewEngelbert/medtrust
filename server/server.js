require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- KONEKSI KE MONGODB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

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

    // ID Unik Berdasarkan Role
    patientId: { type: String, unique: true, sparse: true }, // sparse: true agar null tidak dianggap duplikat
    doctorId: { type: String, unique: true, sparse: true }
});

const User = mongoose.model('User', userSchema);

// --- 2. ROUTE SIGN UP (DAFTAR) ---
app.post('/signup', async (req, res) => {
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
            licenseNumber
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
app.post('/signin', async (req, res) => {
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
                specialization: user.specialization
            }
        });

    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
});

// --- 4. ROUTE UPDATE PROFILE ---
app.put('/update-profile', async (req, res) => {
    try {
        const { email, name, age, domicile, phone, address, specialisation, licenseNumber } = req.body;

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
                licenseNumber: user.licenseNumber
            }
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Gagal mengupdate profile" });
    }
});

// --- 4.5 ROUTE SEARCH PATIENTS ---
app.get('/patients/search', async (req, res) => {
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
const Blockchain = require('./blockchain/Blockchain');
const medTrustChain = new Blockchain();

// GET /chain - Ambil seluruh data blockchain
app.get('/chain', (req, res) => {
    res.json(medTrustChain);
});

// POST /mine - Tambah blok baru (Record Medis)
// POST /mine - Receive and Verify Client-Mined Block
app.post('/mine', (req, res) => {
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

    console.log(`✅ Block #${index} accepted from client! Hash: ${hash}`);

    res.json({
        message: "Block accepted and added to chain",
        block: newBlock
    });
});

// --- JALANKAN SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server berjalan di port ${PORT}`));