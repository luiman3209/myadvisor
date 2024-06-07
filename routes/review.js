const express = require('express');
const { Op } = require('sequelize');
const { Review, Advisor, User, Profile } = require('../models/models');
const router = express.Router();

/**
 * @swagger
 * /latest-reviews:
 *   get:
 *     summary: Retrieve the last x reviews
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of reviews to retrieve
 *         example: 10
 *     responses:
 *       200:
 *         description: A list of the last x reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       review_id:
 *                         type: integer
 *                         example: 1
 *                       advisor_id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       rating:
 *                         type: integer
 *                         example: 5
 *                       comment:
 *                         type: string
 *                         example: "Great service!"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-06-04T12:34:56Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/latest-reviews', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        if (limit > 100) return res.status(400).json({ error: 'Limit must be less than 100' });

        const reviews = await Review.findAll({
            include: [
                { model: Advisor, attributes: ['display_name', 'img_url'], required: true },
                {
                    model: User, attributes: [],
                    include: [{ model: Profile, atttributes: ['first_name'] }],
                    required: true
                },],
            order: [['rating', 'DESC'], ['created_at', 'DESC']],
            limit: parseInt(limit),
        });

        res.json({ reviews });
    } catch (error) {

        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
