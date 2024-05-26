const express = require('express');

const jwt = require('jsonwebtoken');
const { User } = require('../models/models');
const router = express.Router();

// Register Endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Hash the password
        console.log(email, password, role);
        // Create the user with hashed password

        const user = await User.create({ email, password_hash: password, role });

        res.json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login Endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        // Check if user exists and if the password matches
        if (!user || !user.validPassword(password)) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create a JWT token
        const payload = { id: user.user_id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
