const express = require('express');
const passport = require('passport');
const { Advisor, Review, Profile, User } = require('../models/models');

const router = express.Router();


/**
 * @swagger
 * /advisor:
 *   put:
 *     summary: Create or update an advisor profile
 *     tags:
 *       - Advisor
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
 *               qualifications:
 *                 type: string
 *                 example: "MBA, CFA"
 *               expertise:
 *                 type: string
 *                 example: "Investment Management"
 *               services_offered:
 *                 type: string
 *                 example: "Financial Planning, Tax Planning"
 *               contact_information:
 *                 type: string
 *                 example: "contact@advisor.com"
 *               start_shift_1:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-05-01T09:00:00Z"
 *               end_shift_1:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-05-01T17:00:00Z"
 *               start_shift_2:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-05-01T18:00:00Z"
 *               end_shift_2:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-05-01T20:00:00Z"
 *     responses:
 *       200:
 *         description: Advisor profile created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 advisor:
 *                   type: object
 *                   properties:
 *                     advisor_id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     qualifications:
 *                       type: string
 *                     expertise:
 *                       type: string
 *                     services_offered:
 *                       type: string
 *                     contact_information:
 *                       type: string
 *                     start_shift_1:
 *                       type: string
 *                       format: date-time
 *                     end_shift_1:
 *                       type: string
 *                       format: date-time
 *                     start_shift_2:
 *                       type: string
 *                       format: date-time
 *                     end_shift_2:
 *                       type: string
 *                       format: date-time
 *                     profile_views:
 *                       type: integer
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */

router.put('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { qualifications, expertise, services_offered, contact_information, start_shift_1, end_shift_1, start_shift_2, end_shift_2 } = req.body;
    const user_id = req.user.id;
    if (!user_id || !qualifications || !expertise || !services_offered || !contact_information || !start_shift_1 || !end_shift_1) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        let advisor = await Advisor.findOne({ where: { user_id } });

        if (advisor) {
            // Update existing advisor
            advisor.qualifications = qualifications;
            advisor.expertise = expertise;
            advisor.services_offered = services_offered;
            advisor.contact_information = contact_information;
            advisor.start_shift_1 = start_shift_1;
            advisor.end_shift_1 = end_shift_1;
            advisor.start_shift_2 = start_shift_2;
            advisor.end_shift_2 = end_shift_2;
            advisor.updated_at = new Date();
        } else {
            // Create new advisor
            advisor = await Advisor.create({
                user_id,
                qualifications,
                expertise,
                services_offered,
                contact_information,
                start_shift_1,
                end_shift_1,
                start_shift_2,
                end_shift_2
            });
        }

        await advisor.save();
        res.json({ message: 'Advisor profile created or updated successfully', advisor });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /advisor:
 *   get:
 *     summary: Get detailed advisor profile
 *     tags:
 *       - Advisor
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
 *     tags:
 *       - Advisor
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
 *     tags:
 *       - Advisor
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
 *     tags:
 *       - Advisor
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
