const express = require('express');
const { Op } = require('sequelize');
const { Advisor, Profile, Review } = require('../models/models');

const router = express.Router();
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
 *                   advisor_id:
 *                     type: integer
 *                     example: 1
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   operating_country_code:
 *                     type: string
 *                     example: "US"
 *                   qualifications:
 *                     type: string
 *                     example: "MBA, CFA"
 *                   expertise:
 *                     type: string
 *                     example: "Investment Management"
 *                   contact_information:
 *                     type: string
 *                     example: "contact@advisor.com"
 *                   name:
 *                     type: string
 *                     example: "John"
 *                   surname:
 *                     type: string
 *                     example: "Doe"
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
      const { operating_country_code, service_id } = req.query;
  
      if (!operating_country_code && !service_id) {
        return res.status(400).json({ message: 'At least one of operating_country_code or service_id must be provided' });
      }
  
      const filters = {};
  
      if (operating_country_code) {
        filters.operating_country_code = operating_country_code;
      }
  
      const includeServices = service_id ? {
        model: ServiceType,
        through: {
          where: { service_id },
        },
      } : null;
  
      const advisors = await Advisor.findAll({
        where: filters,
        include: [
          includeServices,
          {
            model: Profile,
            attributes: ['first_name', 'last_name'],
            required: true,
          },
        ].filter(Boolean), // Filter out null includes
      });
  
      res.json(advisors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


module.exports = router;
