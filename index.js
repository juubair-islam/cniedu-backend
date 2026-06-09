const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

// Firebase Initialize
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
    });
}

// API Route
app.post('/api/update-password', async (req, res) => {
    try {
        const { uid, newPassword } = req.body;
        if (!uid || !newPassword) return res.status(400).json({ error: "Missing data" });

        await admin.auth().updateUser(uid, { password: newPassword });
        res.status(200).json({ success: true, message: "Password updated!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;