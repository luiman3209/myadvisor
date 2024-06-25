const express = require('express');
const { Review, Advisor, Appointment, AdvisorService } = require('../models/models');
const router = express.Router();
const { Op } = require('sequelize');
const { retrieveFreeWindows } = require('../utils/bookingUtils');
const { validationResult, query } = require('express-validator');

// Validation middleware
const getAdvisorsValidationRules = [
    query('operating_country_code').optional().isLength({ min: 1 }).trim(),
    query('service_id').optional().isInt().toInt(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];

router.get('/advisors', getAdvisorsValidationRules, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { operating_country_code, service_id, page = 1, limit = 10 } = req.query;

        if (!operating_country_code && !service_id) {
            return res.status(400).json({ message: 'At least one of operating_country_code or service_id must be provided' });
        }

        const whereClause = {};

        if (service_id) {
            const advisorServices = await AdvisorService.findAll({
                attributes: ['advisor_id'],
                where: { service_id: service_id }
            });

            const advisorIds = advisorServices.map(advisorService => advisorService.advisor_id);

            whereClause.advisor_id = { [Op.in]: advisorIds };

            if (operating_country_code) {
                whereClause.operating_country_code = operating_country_code;
            }
        } else if (operating_country_code) {
            whereClause.operating_country_code = operating_country_code;
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await Advisor.findAndCountAll({
            where: whereClause,
            attributes: [
                'advisor_id',
                'operating_country_code',
                'contact_information',
                'display_name',
                'office_address',
                'operating_city_code',
                'img_url',
                'start_shift_1',
                'end_shift_1'
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        const totalPages = Math.ceil(count / limit);

        let advisorDtos = [];

        for (const advisor of rows) {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setDate(start.getDate() + 5);
            end.setHours(23, 59, 59, 999);

            const appointments = await Appointment.findAll({
                where: {
                    advisor_id: advisor.advisor_id,
                    start_time: { [Op.between]: [start, end] },
                },
                order: [['start_time', 'ASC']],
            });

            const freeWindows = retrieveFreeWindows(advisor, appointments, start, end);

            const reviews = await Review.findAll({
                where: { advisor_id: advisor.advisor_id },
                attributes: ['rating'],
            });

            let totalRating = 0;
            for (const review of reviews) {
                totalRating += review.rating;
            }

            const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

            const advisorServices = await AdvisorService.findAll({
                where: { advisor_id: advisor.advisor_id },
                attributes: ['service_id']
            });

            const advisorServiceIds = advisorServices.map(service => service.service_id);

            advisorDtos.push({
                advisor_id: advisor.advisor_id,
                advisor_services: advisorServiceIds,
                contact_information: advisor.contact_information,
                display_name: advisor.display_name,
                img_url: advisor.img_url,
                office_address: advisor.office_address,
                operating_city_code: advisor.operating_city_code,
                operating_country_code: advisor.operating_country_code,
                free_windows: freeWindows,
                average_rating: averageRating,
                review_count: reviews.length,
            });
        }

        res.json({
            totalItems: count,
            totalPages: totalPages,
            currentPage: parseInt(page),
            advisors: advisorDtos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
