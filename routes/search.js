const express = require('express');
const { Review, Advisor, Appointment, AdvisorService } = require('../models/models');
const router = express.Router();
const { Op } = require('sequelize');
const { retrieveFreeWindows } = require('../utils/bookingUtils');
/**
 * @swagger
 * /search/advisors:
 *   get:
 *     summary: Search for financial advisors based on country code and service ID
 *     tags:
 *       - Search
 *     parameters:
 *       - in: query
 *         name: operating_country_code
 *         schema:
 *           type: string
 *         description: Filter by operating country code
 *         example: "US"
 *       - in: query
 *         name: service_id
 *         schema:
 *           type: integer
 *         description: Filter by service ID
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: A list of financial advisors matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                   example: 50
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 advisors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       advisor_id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       operating_country_code:
 *                         type: string
 *                         example: "US"
 *                       qualifications:
 *                         type: string
 *                         example: "MBA, CFA"
 *                       contact_information:
 *                         type: string
 *                         example: "contact@advisor.com"
 *                       name:
 *                         type: string
 *                         example: "John"
 *                       surname:
 *                         type: string
 *                         example: "Doe"
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

        const { operating_country_code, service_id, page = 1, limit = 10 } = req.query;

        if (!operating_country_code && !service_id) {
            return res.status(400).json({ message: 'At least one of operating_country_code or service_id must be provided' });
        }

        const filters = {};
        if (operating_country_code) {
            filters.operating_country_code = operating_country_code;
        }

        const includeServices = service_id ? {
            model: AdvisorService,
            attributes: ['service_id'],
        } : null;

        const offset = (page - 1) * limit;

        const { count, rows } = await Advisor.findAndCountAll({
            where: filters,
            attributes: ['advisor_id',
                'operating_country_code',
                'contact_information',
                'display_name',
                'office_address',
                'operating_city_code',
                'img_url',
                'start_shift_1',
                'end_shift_1'
            ],
            include: [
                includeServices,
            ].filter(Boolean),
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        const totalPages = Math.ceil(count / limit);

        let advisorDtos = [];

        // Include free windows for each advisor
        for (const advisor of rows) {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setDate(start.getDate() + 7);
            end.setHours(23, 59, 59, 999);



            const appointments = await Appointment.findAll({
                where: {
                    advisor_id: advisor.advisor_id,
                    start_time: {
                        [Op.between]: [start, end],
                    },
                },
                order: [['start_time', 'ASC']],
            });



            const freeWindows = retrieveFreeWindows(advisor, appointments, start, end);

            advisorDtos.push({
                advisor_id: advisor.advisor_id,
                advisor_services: advisor.advisor_services,
                contact_information: advisor.contact_information,
                display_name: advisor.display_name,
                img_url: advisor.img_url,
                office_address: advisor.office_address,
                operating_city_code: advisor.operating_city_code,
                operating_country_code: advisor.operating_country_code,
                free_windows: freeWindows,
            });
        }


        res.json({
            totalItems: count,
            totalPages: totalPages,
            currentPage: parseInt(page),
            advisors: advisorDtos
        });
    } catch (error) {
        res.status(500).json({ error: error.message });

    }
});




module.exports = router;
