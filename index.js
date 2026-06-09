const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// ১. CORS এর জন্য কড়া সিকিউরিটি হেডার
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(express.json());

// ২. Firebase Admin Init (নিরাপদ উপায়)
if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY 
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
            : '';

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey
            })
        });
        console.log("Firebase initialized.");
    } catch (err) {
        console.error("Firebase Init Error:", err);
    }
}

// ৩. মেইন API
app.post('/api/update-password', async (req, res) => {
    try {
        const { uid, newPassword } = req.body;
        
        if (!uid || !newPassword) {
            return res.status(400).json({ error: "Missing uid/password" });
        }

        // Firebase Auth আপডেট
        await admin.auth().updateUser(uid, { password: newPassword });
        return res.status(200).json({ success: true });
        
    } catch (error) {
        // এখানে এরর হলে আমরা পরিষ্কার এরর মেসেজ পাঠাচ্ছি, সার্ভার ক্র্যাশ করবে না
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = app;