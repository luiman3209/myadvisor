const express = require('express');
const passport = require('passport');
const { Profile } = require('../models/models');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const xss = require('xss');

// Validation middleware
const profileValidationRules = [
    body('first_name').notEmpty().trim().escape(),
    body('last_name').notEmpty().trim().escape(),
    body('phone_number').notEmpty().trim().isMobilePhone().escape(),
    body('address').optional({ nullable: true }).trim(),
];

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const profile = await Profile.findOne({ where: { user_id: req.user.id } });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/', passport.authenticate('jwt', { session: false }), profileValidationRules, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { first_name, last_name, phone_number, address } = req.body;

        // Make only first letter uppercase for first and last name
        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

        let profile = await Profile.findOne({ where: { user_id: req.user.id } });
        if (!profile) {
            // Create new profile if not found
            profile = await Profile.create({
                user_id: req.user.id,
                first_name: capitalize(first_name),
                last_name: capitalize(last_name),
                phone_number,
                address: xss(address), // Sanitize address
                visibility: 'private'
            });
            return res.status(200).json({ message: 'Profile created successfully', profile });
        }

        // Update existing profile
        profile.first_name = capitalize(first_name);
        profile.last_name = capitalize(last_name);
        profile.phone_number = phone_number;
        profile.address = xss(address); // Sanitize address
        await profile.save();

        return res.status(200).json({ message: 'Profile updated successfully', profile });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
