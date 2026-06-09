const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// 🔥 The Bulletproof CORS Middleware 🔥
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    // ব্রাউজারের Preflight (OPTIONS) রিকোয়েস্ট সরাসরি পাস করে দেওয়া
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});

app.use(express.json());
app.use(cors());

// Firebase Admin Setup using Environment Variables
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

// Password Update API Route
app.post('/api/update-password', async (req, res) => {
    const { uid, newPassword } = req.body;
    
    if (!uid || !newPassword) {
        return res.status(400).json({ error: "Missing uid or password" });
    }

    try {
        await admin.auth().updateUser(uid, { password: newPassword });
        res.status(200).json({ success: true, message: "Password forcefully updated!" });
    } catch (error) {
        console.error("Firebase Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = app;