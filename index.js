const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// Middleware
app.use(cors({ origin: '*' })); // যেকোনো জায়গা থেকে রিকোয়েস্ট অ্যালাউ করবে
app.use(express.json());

// Firebase Admin Setup using Environment Variables (Super Secure!)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Private key তে \n গুলো ঠিক করার জন্য replace করা হয়েছে
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
        // ফায়ারবেস অথেনটিকেশনে পাসওয়ার্ড আপডেট করা
        await admin.auth().updateUser(uid, { password: newPassword });
        res.status(200).json({ success: true, message: "Password forcefully updated!" });
    } catch (error) {
        console.error("Firebase Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Vercel Serverless Function এর জন্য export করতে হয়
module.exports = app;