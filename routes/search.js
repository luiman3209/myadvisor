const express = require('express');
const { Op } = require('sequelize');
const { Advisor, Profile, Review } = require('../models/models');

const router = express.Router();

/**
 * @swagger
 * /search/advisors:
 *   get:
 *     summary: Search for financial advisors based on location, expertise, and services offered
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *         example: "New York"
 *       - in: query
 *         name: expertise
 *         schema:
 *           type: string
 *         description: Filter by expertise
 *         example: "Retirement Planning"
 *       - in: query
 *         name: services
 *         schema:
 *           type: string
 *         description: Filter by services offered
 *         example: "Tax Planning"
 *       - in: query
 *         name: rating_min
 *         schema:
 *           type: integer
 *         description: Minimum rating
 *         example: 3
 *       - in: query
 *         name: rating_max
 *         schema:
 *           type: integer
 *         description: Maximum rating
 *         example: 5
 *       - in: query
 *         name: price_min
 *         schema:
 *           type: integer
 *         description: Minimum price
 *       - in: query
 *         name: price_max
 *         schema:
 *           type: integer
 *         description: Maximum price
 *     responses:
 *       200:
 *         description: A list of financial advisors matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   location:
 *                     type: string
 *                     example: "New York"
 *                   expertise:
 *                     type: string
 *                     example: "Retirement Planning"
 *                   services_offered:
 *                     type: string
 *                     example: "Tax Planning"
 *                   Profile:
 *                     type: object
 *                     properties:
 *                       first_name:
 *                         type: string
 *                         example: "John"
 *                       last_name:
 *                         type: string
 *                         example: "Doe"
 *                       phone_number:
 *                         type: string
 *                         example: "123-456-7890"
 *                       address:
 *                         type: string
 *                         example: "123 Main St"
 *                   Reviews:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         rating:
 *                           type: integer
 *                           example: 4
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
router.get('/advisors', async (req, res) => {
    try {
        const { location, expertise, services, rating_min, rating_max, price_min, price_max } = req.query;

        const filters = {};

        if (location) {
            filters.location = { [Op.iLike]: `%${location}%` };
        }

        if (expertise) {
            filters.expertise = { [Op.iLike]: `%${expertise}%` };
        }

        if (services) {
            filters.services_offered = { [Op.iLike]: `%${services}%` };
        }

        const advisors = await Advisor.findAll({
            where: filters,
            include: [{
                model: Profile,
                required: true,
            }, {
                model: Review,
                required: false,
                attributes: ['rating'],
                where: rating_min || rating_max ? {
                    rating: {
                        [Op.between]: [rating_min || 1, rating_max || 5],
                    },
                } : {},
            }],
        });

        res.json(advisors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
