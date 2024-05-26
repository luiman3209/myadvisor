const express = require('express');
const { Op } = require('sequelize');
const { Advisor, Profile, Review } = require('../models/models');

const router = express.Router();

// Search for financial advisors based on location, expertise, and services offered
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
