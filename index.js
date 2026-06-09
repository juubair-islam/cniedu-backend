const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// 1. CORS কনফিগারেশন (সবচেয়ে শক্তিশালী সেটিংস)
app.use(cors({
    origin: '*', // সব ডোমেইন থেকে রিকোয়েস্ট অ্যালাউ করবে
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

// Preflight রিকোয়েস্ট হ্যান্ডলিং
app.options('*', cors());

app.use(express.json());

// 2. Firebase Admin Setup
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
    });
}

// 3. Password Update API Route
app.post('/api/update-password', async (req, res) => {
    const { uid, newPassword } = req.body;
    
    if (!uid || !newPassword) {
        return res.status(400).json({ error: "Missing uid or password" });
    }

    try {
        await admin.auth().updateUser(uid, { password: newPassword });
        return res.status(200).json({ success: true, message: "Password forcefully updated!" });
    } catch (error) {
        console.error("Firebase Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = app;