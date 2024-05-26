const express = require('express');
const passport = require('passport');
const { Profile } = require('../models/models');

const router = express.Router();

// Get user profile
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
});

// Update or create user profile
router.put('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { first_name, last_name, phone_number, address, preferences, financial_goals, visibility } = req.body;

    let profile = await Profile.findOne({ where: { user_id: req.user.id } });
    if (!profile) {
        // Create new profile if not found
        profile = await Profile.create({
            user_id: req.user.id,
            first_name,
            last_name,
            phone_number,
            address,
            preferences,
            financial_goals,
            visibility
        });
        return res.status(201).json({ message: 'Profile created successfully', profile });
    }

    // Update existing profile
    await profile.update({ first_name, last_name, phone_number, address, preferences, financial_goals, visibility });
    res.json({ message: 'Profile updated successfully', profile });
});



module.exports = router;
