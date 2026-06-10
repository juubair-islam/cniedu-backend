const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let admin;
let initStatus = "Not initialized";
let initError = null;

// সার্ভার স্টার্ট হওয়ার সময় সব ধরনের এরর ধরার জন্য কড়া সেফটি নেট
try {
    admin = require('firebase-admin');
    if (!admin.apps || admin.apps.length === 0) {
        // এনভায়রনমেন্ট ভেরিয়েবল থেকে এক্সট্রা কোটেশন বা স্পেস মুছে ফেলার ট্রিক
        const privateKey = process.env.FIREBASE_PRIVATE_KEY 
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '') 
            : '';

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey
            })
        });
        initStatus = "Firebase Initialized Successfully! 🔥";
    }
} catch (err) {
    initError = err.message || err.toString();
    initStatus = "Firebase Initialization Failed ❌";
}

// 🟢 হেলথ চেক রাউট (ব্রাউজারে চেক করার জন্য)
app.get('/', (req, res) => {
    res.json({ 
        Message: "Server is running perfectly!", 
        Firebase_Status: initStatus, 
        Error_Details: initError 
    });
});

// 🔴 আসল API রাউট
app.post('/api/update-password', async (req, res) => {
    // যদি ফায়ারবেস স্টার্ট হতে না পারে, তবে এখানেই এরর দিয়ে দেবে
    if (initError) {
        return res.status(500).json({ success: false, error: "Server Setup Failed: " + initError });
    }
    
    try {
        const { uid, newPassword } = req.body;
        if (!uid || !newPassword) {
            return res.status(400).json({ error: "Missing uid or newPassword" });
        }

        await admin.auth().updateUser(uid, { password: newPassword });
        return res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = app;