const express = require('express');
const passport = require('passport');
const { Advisor, Review, Profile, User } = require('../models/models');

const router = express.Router();

/**
 * @swagger
 * /advisor:
 *   get:
 *     summary: Get detailed advisor profile
 *     responses:
 *       200:
 *         description: Detailed advisor profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 advisor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     specialty:
 *                       type: string
 *                       example: Financial Advisor
 *                 profileReviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       advisor_id:
 *                         type: integer
 *                         example: 1
 *                       review:
 *                         type: string
 *                         example: "Great advice!"
 *                       rating:
 *                         type: integer
 *                         example: 5
 */
router.get('/', async (req, res) => {
    try {
        // Find the advisor using the user_id
        const advisor = await Advisor.findOne({
            where: { user_id: req.user.id },
            include: [
                {
                    model: Profile,
                    include: [{ model: User, attributes: ['email', 'created_at'] }],
                },
                {
                    model: Review,
                    include: [{ model: User, attributes: ['email'] }],
                },
            ],
        });

        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }

        // Fetch reviews for the advisor
        const profileReviews = await Review.findAll({
            where: { advisor_id: advisor.id }, // Assuming the Review model has advisor_id that refers to Advisor model
            include: [{ model: User, attributes: ['email'] }],
        });

        res.json({
            advisor,
            profileReviews,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /advisor/{advisorId}:
 *   get:
 *     summary: Get detailed advisor profile by ID
 *     parameters:
 *       - in: path
 *         name: advisorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The advisor ID
 *     responses:
 *       200:
 *         description: Detailed advisor profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 advisor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     specialty:
 *                       type: string
 *                       example: Financial Advisor
 *                 profileReviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       advisor_id:
 *                         type: integer
 *                         example: 1
 *                       review:
 *                         type: string
 *                         example: "Great advice!"
 *                       rating:
 *                         type: integer
 *                         example: 5
 */
router.get('/:advisorId', async (req, res) => {
    try {
        const advisor = await Advisor.findByPk(req.params.advisorId, {
            include: [
                {
                    model: Profile,
                    include: [{ model: User, attributes: ['email', 'created_at'] }],
                },
                {
                    model: Review,
                    include: [{ model: User, attributes: ['email'] }],
                },
            ],
        });

        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }

        const profileReviews = await Review.findAll({
            where: { advisor_id: req.params.advisorId },
            include: [{ model: User, attributes: ['email'] }],
        });

        res.json({
            advisor,
            profileReviews,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /advisor/{advisorId}/review:
 *   post:
 *     summary: Leave a review for an advisor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: advisorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The advisor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 example: 5
 *               review:
 *                 type: string
 *                 example: "Great advice!"
 *     responses:
 *       200:
 *         description: Review added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review added successfully"
 *                 review:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     advisor_id:
 *                       type: integer
 *                       example: 1
 *                     rating:
 *                       type: integer
 *                       example: 5
 *                     review:
 *                       type: string
 *                       example: "Great advice!"
 */
router.post('/:advisorId/review', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { rating, review } = req.body;
        const { advisorId } = req.params;
        const userId = req.user.id;

        const newReview = await Review.create({
            user_id: userId,
            advisor_id: advisorId,
            rating,
            review,
        });

        res.json({ message: 'Review added successfully', review: newReview });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /advisor/{advisorId}/contact:
 *   get:
 *     summary: Get advisor contact information
 *     parameters:
 *       - in: path
 *         name: advisorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The advisor ID
 *     responses:
 *       200:
 *         description: Advisor contact information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: "advisor@example.com"
 *                 contactInformation:
 *                   type: string
 *                   example: "Contact details here"
 *       404:
 *         description: Advisor not found
 */
router.get('/:advisorId/contact', async (req, res) => {
    try {
        const advisor = await Advisor.findByPk(req.params.advisorId, {
            include: [{ model: User, attributes: ['email'] }],
        });

        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }

        res.json({
            email: advisor.User.email,
            contactInformation: advisor.contact_information,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
