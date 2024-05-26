
const express = require('express');

const { User } = require('../models/models');
require('dotenv').config();

const router = express.Router();


// Get User Info Endpoint
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update User Endpoint
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, password, role } = req.body;

        // Find the user
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        user.email = email || user.email;
        user.role = role || user.role;

        await user.save();

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});