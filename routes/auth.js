const express = require('express');
const jwt = require('jsonwebtoken');
const { User, Profile } = require('../models/models');
const router = express.Router();
const passport = require('passport');


router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check if the email is already in use
        if (await User.findOne({ where: { email } })) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        if (role !== 'investor' && role !== 'advisor' && role !== 'admin') {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Create the user with hashed password
        const user = await User.create({ email, password_hash: password, role });


        res.json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        // Check if user exists and if the password matches
        if (!user || ! await user.validPassword(password)) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create a JWT token
        const payload = { id: user.user_id, email: user.email, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        res.json({ available: !user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/check-phone', async (req, res) => {
    try {
        const { phone_number } = req.body;
        const user = await Profile.findOne({ where: { phone_number } });

        res.json({ available: !user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/user/update', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { user_id: req.user.id } });

        // Check if user exists and if the password matches
        if (!user || ! await user.validPassword(password)) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }


        if (email) {
            await User.update({ email }, { where: { user_id: req.user.id } });
        }

        if (password) {
            await User.update({ password_hash: password }, { where: { user_id: req.user.id } });
        }

        res.json({ message: 'User updated successfully', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
