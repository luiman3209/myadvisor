const express = require('express');
const passport = require('passport');
const { Investor, User } = require('../models/models');
const { ServiceType,  InvestorService } = require('../models/models');

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
 *               geo_preferences:
 *                 type: string
 *                 example: "North America"
 *               selected_service_types:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
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
 *                     geo_preferences:
 *                       type: string
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */

router.put('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { net_worth, income_range, geo_preferences, selected_service_types } = req.body;
    const user_id = req.user.id;

    if (!user_id || !net_worth || !income_range) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        let investor = await Investor.findOne({ where: { user_id } });

        if (investor) {
            // Update existing investor
            investor.net_worth = net_worth;
            investor.income_range = income_range;
            investor.geo_preferences = geo_preferences;
            investor.updated_at = new Date();
        } else {
            // Create new investor
            investor = await Investor.create({
                user_id,
                net_worth,
                income_range,
                geo_preferences
            });
        }

        await investor.save();

        // Update investor service types
        if (selected_service_types && Array.isArray(selected_service_types)) {
            await InvestorService.destroy({ where: { investor_id: investor.investor_id } });
            const investorServices = selected_service_types.map(service_id => ({
                investor_id: investor.investor_id,
                service_id
            }));
            await InvestorService.bulkCreate(investorServices);
        }

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
 *                     geo_preferences:
 *                       type: string
 *                       example: "North America"
 *                 serviceTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       service_id:
 *                         type: integer
 *                         example: 1
 *                       service_type_name:
 *                         type: string
 *                         example: "Financial Planning"
 *                       service_type_code:
 *                         type: string
 *                         example: "FP"
 *                       is_active:
 *                         type: string
 *                         example: "Y"
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

        // Fetch service types for the investor
        const investorServices = await InvestorService.findAll({ where: { investor_id: investor.investor_id } });
        const serviceIds = investorServices.map(is => is.service_id);
        const serviceTypes = await ServiceType.findAll({ where: { service_id: serviceIds } });

        res.json({ investor, serviceTypes });
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
 *                     geo_preferences:
 *                       type: string
 *                       example: "North America"
 *                 serviceTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       service_id:
 *                         type: integer
 *                         example: 1
 *                       service_type_name:
 *                         type: string
 *                         example: "Financial Planning"
 *                       service_type_code:
 *                         type: string
 *                         example: "FP"
 *                       is_active:
 *                         type: string
 *                         example: "Y"
 */
router.get('/:investorId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        res.status(400).json({ message: 'DISABLED' });

        const investor = await Investor.findByPk(req.params.investorId, {
            include: [{ model: User, attributes: ['email', 'created_at'] }],
        });

        if (!investor) {
            return res.status(404).json({ message: 'Investor not found' });
        }

        // Fetch service types for the investor
        const investorServices = await InvestorService.findAll({ where: { investor_id: req.params.investorId } });
        const serviceIds = investorServices.map(is => is.service_id);
        const serviceTypes = await ServiceType.findAll({ where: { service_id: serviceIds } });

        res.json({ investor, serviceTypes });
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
