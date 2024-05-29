const express = require('express');
const passport = require('passport');
const { Investor, User } = require('../models/models');

const router = express.Router();

/**
 * @swagger
 * /investor:
 *   put:
 *     summary: Create or update an investor profile
 *     tags:
 *       - Investor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               net_worth:
 *                 type: string
 *                 example: "100000-199999"
 *               income_range:
 *                 type: string
 *                 example: "75000-99999"
 *               financial_goals:
 *                 type: string
 *                 example: "retirement_planning"
 *               geo_preferences:
 *                 type: string
 *                 example: "North America"
 *     responses:
 *       200:
 *         description: Investor profile created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 investor:
 *                   type: object
 *                   properties:
 *                     investor_id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     net_worth:
 *                       type: string
 *                     income_range:
 *                       type: string
 *                     financial_goals:
 *                       type: string
 *                     geo_preferences:
 *                       type: string
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */

router.put('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const {net_worth, income_range, financial_goals, geo_preferences } = req.body;

    const user_id = req.user.id;

    if (!user_id || !net_worth || !income_range || !financial_goals) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        let investor = await Investor.findOne({ where: { user_id } });

        if (investor) {
            // Update existing investor
            investor.net_worth = net_worth;
            investor.income_range = income_range;
            investor.financial_goals = financial_goals;
            investor.geo_preferences = geo_preferences;
            investor.updated_at = new Date();
        } else {
            // Create new investor
            investor = await Investor.create({
                user_id,
                net_worth,
                income_range,
                financial_goals,
                geo_preferences
            });
        }

        await investor.save();
        res.json({ message: 'Investor profile created or updated successfully', investor });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /investor:
 *   get:
 *     summary: Get detailed investor profile
 *     tags:
 *       - Investor
 *     responses:
 *       200:
 *         description: Detailed investor profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 investor:
 *                   type: object
 *                   properties:
 *                     investor_id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     net_worth:
 *                       type: string
 *                       example: "100000-199999"
 *                     income_range:
 *                       type: string
 *                       example: "75000-99999"
 *                     financial_goals:
 *                       type: string
 *                       example: "retirement_planning"
 *                     geo_preferences:
 *                       type: string
 *                       example: "North America"
 */
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const investor = await Investor.findOne({
            where: { user_id: req.user.id },
            include: [{ model: User, attributes: ['email', 'created_at'] }],
        });

        if (!investor) {
            return res.status(404).json({ message: 'Investor not found' });
        }

        res.json({ investor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /investor/{investorId}:
 *   get:
 *     summary: Get detailed investor profile by ID
 *     tags:
 *       - Investor
 *     parameters:
 *       - in: path
 *         name: investorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The investor ID
 *     responses:
 *       200:
 *         description: Detailed investor profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 investor:
 *                   type: object
 *                   properties:
 *                     investor_id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     net_worth:
 *                       type: string
 *                       example: "100000-199999"
 *                     income_range:
 *                       type: string
 *                       example: "75000-99999"
 *                     financial_goals:
 *                       type: string
 *                       example: "retirement_planning"
 *                     geo_preferences:
 *                       type: string
 *                       example: "North America"
 */
router.get('/:investorId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const investor = await Investor.findByPk(req.params.investorId, {
            include: [{ model: User, attributes: ['email', 'created_at'] }],
        });

        if (!investor) {
            return res.status(404).json({ message: 'Investor not found' });
        }

        res.json({ investor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /investor/{investorId}/contact:
 *   get:
 *     summary: Get investor contact information
 *     tags:
 *       - Investor
 *     parameters:
 *       - in: path
 *         name: investorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The investor ID
 *     responses:
 *       200:
 *         description: Investor contact information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: "investor@example.com"
 *                 geo_preferences:
 *                   type: string
 *                   example: "North America"
 *       404:
 *         description: Investor not found
 */
router.get('/:investorId/contact', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const investor = await Investor.findByPk(req.params.investorId, {
            include: [{ model: User, attributes: ['email'] }],
        });

        if (!investor) {
            return res.status(404).json({ message: 'Investor not found' });
        }

        res.json({
            email: investor.User.email,
            geo_preferences: investor.geo_preferences,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
