const express = require('express');
const passport = require('passport');
const { Profile } = require('../models/models');

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
});


router.put('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { first_name, last_name, phone_number, address } = req.body;

    if (!first_name || !last_name || !phone_number || !address) {
        return res.status(400).json({ message: 'Please provide first name, last name, phone number and address for first registration' });
    }

    // Make only first letter upper case for first and last name
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();


    let profile = await Profile.findOne({ where: { user_id: req.user.id } });
    if (!profile) {

        try {
            // Create new profile if not found
            profile = await Profile.create({
                user_id: req.user.id,
                first_name: capitalize(first_name),
                last_name: capitalize(last_name),
                phone_number,
                address,
                visibility: 'private'
            });

            return res.status(200).json({ message: 'Profile created successfully', profile });
        } catch (e) {

            res.status(400).json({ message: 'Error saving profile info', error: e })
        }

    }
    try {

        // Update existing profile
        profile.first_name = first_name;
        profile.last_name = last_name;
        profile.phone_number = phone_number;
        profile.address = address;
        await profile.save();
        return res.status(200).json({ message: 'Profile updated successfully', profile });
    } catch (e) {

        res.status(400).json({ message: 'Error updating profile info', error: e })
    }

});

module.exports = router;
