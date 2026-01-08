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
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Data Profil Tambahan (Boleh kosong dulu / required: false)
    fullName:    { type: String, required: false }, // Contoh: Edwin
    age:         { type: Number, required: false }, // Contoh: 34
    domicile:    { type: String, required: false }, // Contoh: Jakarta, Indonesia
    phoneNumber: { type: String, required: false }, // Contoh: +62 812...
    address:     { type: String, required: false }, // Contoh: Jl. Jend Sudirman...
    
    // ID Pasien (Dibuat otomatis oleh sistem, bukan input user)
    patientId:   { type: String, unique: true }     // Contoh: #8824192
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
            address
        } = req.body;

        // Cek email ganda
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah terdaftar!" });
        }

        // Enkripsi password
        const hashedPassword = await bcrypt.hash(password, 10);

        // GENERATE PATIENT ID OTOMATIS
        // Format: Tanda Pagar (#) + 6 digit angka random
        const randomNumbers = Math.floor(100000 + Math.random() * 900000); 
        const generatedPatientId = `#${randomNumbers}`;

        // Masukkan data ke database
        const newUser = new User({ 
            username, 
            email, 
            password: hashedPassword,
            fullName,
            age,
            domicile,
            phoneNumber,
            address,
            patientId: generatedPatientId 
        });
        
        await newUser.save();

        res.status(201).json({ 
            message: "User berhasil dibuat!", 
            patientId: generatedPatientId // Kirim balik ID ke frontend kalau perlu
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
                patientId: user.patientId,
                fullName: user.fullName,
                age: user.age,
                domicile: user.domicile,
                phoneNumber: user.phoneNumber,
                address: user.address
            } 
        });

    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
});

// --- JALANKAN SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server berjalan di port ${PORT}`));