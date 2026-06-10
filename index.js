const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// একদম সিম্পল ও সেফ CORS
app.use(cors());
app.use(express.json());

// Firebase Admin Setup
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
        console.log("Firebase initialized successfully.");
    } catch (err) {
        console.error("Firebase Init Error:", err);
    }
}

// Password Update API Route
app.post('/api/update-password', async (req, res) => {
    try {
        const { uid, newPassword } = req.body;
        
        if (!uid || !newPassword) {
            return res.status(400).json({ error: "Missing uid or password in request body" });
        }

        await admin.auth().updateUser(uid, { password: newPassword });
        return res.status(200).json({ success: true, message: "Password forcefully updated!" });
        
    } catch (error) {
        console.error("Firebase Update Error:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = app;