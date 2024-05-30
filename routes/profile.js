const express = require('express');
const passport = require('passport');
const { Profile } = require('../models/models');

const router = express.Router();

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *                 first_name:
 *                   type: string
 *                   example: "John"
 *                 last_name:
 *                   type: string
 *                   example: "Doe"
 *                 phone_number:
 *                   type: string
 *                   example: "123-456-7890"
 *                 address:
 *                   type: string
 *                   example: "123 Main St"
 *                 preferences:
 *                   type: string
 *                   example: "Preference details"
 *                 visibility:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile not found"
 */
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
});

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update or create user profile
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               phone_number:
 *                 type: string
 *                 example: "123-456-7890"
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *               preferences:
 *                 type: string
 *                 example: "Preference details"
 *               visibility:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                     phone_number:
 *                       type: string
 *                       example: "123-456-7890"
 *                     address:
 *                       type: string
 *                       example: "123 Main St"
 *                     preferences:
 *                       type: string
 *                       example: "Preference details"
 *                     visibility:
 *                       type: boolean
 *                       example: true
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile created successfully"
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                     phone_number:
 *                       type: string
 *                       example: "123-456-7890"
 *                     address:
 *                       type: string
 *                       example: "123 Main St"
 *                     preferences:
 *                       type: string
 *                       example: "Preference details"
 *                     visibility:
 *                       type: boolean
 *                       example: true
 */
router.put('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { first_name, last_name, phone_number, address, preferences, visibility } = req.body;
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
            visibility
        });
        return res.status(200).json({ message: 'Profile created successfully', profile });
    }

    // Update existing profile
    await profile.update({ first_name, last_name, phone_number, address, preferences, visibility });

    res.json({ message: 'Profile updated successfully', profile });
});

module.exports = router;
