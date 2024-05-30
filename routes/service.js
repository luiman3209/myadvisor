const express = require('express');
const router = express.Router();
const { ServiceType, AdvisorService, InvestorService } = require('../models/models');

/**
 * @swagger
 * tags:
 *   name: Service
 *   description: Service type management
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all service types
 *     tags: [Service]
 *     description: Retrieve a list of all service types.
 *     responses:
 *       200:
 *         description: A list of service types.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   service_id:
 *                     type: integer
 *                   service_type_name:
 *                     type: string
 *                   is_active:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: An error occurred while fetching service types.
 */
router.get('/', async (req, res) => {
    try {
        const serviceTypes = await ServiceType.findAll();
        res.json(serviceTypes);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching service types.' });
    }
});

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get a service type by ID
 *     tags: [Service]
 *     description: Retrieve a service type by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the service type.
 *     responses:
 *       200:
 *         description: A service type object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service_id:
 *                   type: integer
 *                 service_type_name:
 *                   type: string
 *                 is_active:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Service type not found.
 *       500:
 *         description: An error occurred while fetching the service type.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const serviceType = await ServiceType.findByPk(id);
        if (serviceType) {
            res.json(serviceType);
        } else {
            res.status(404).json({ error: 'Service type not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the service type.' });
    }
});

/**
 * @swagger
 * /advisor/{advisor_id}:
 *   get:
 *     summary: Get service types by advisor ID
 *     tags: [Service]
 *     description: Retrieve service types associated with a specific advisor by the advisor's ID.
 *     parameters:
 *       - in: path
 *         name: advisor_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the advisor.
 *     responses:
 *       200:
 *         description: A list of service types associated with the advisor.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   service_id:
 *                     type: integer
 *                   service_type_name:
 *                     type: string
 *                   is_active:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Advisor not found or no associated service types.
 *       500:
 *         description: An error occurred while fetching the service types.
 */
router.get('/advisor/:advisor_id', async (req, res) => {
    const { advisor_id } = req.params;
    try {
        const advisorServices = await AdvisorService.findAll({ where: { advisor_id } });
        if (advisorServices.length > 0) {
            const serviceIds = advisorServices.map(as => as.service_id);
            const serviceTypes = await ServiceType.findAll({ where: { service_id: serviceIds } });
            res.json(serviceTypes);
        } else {
            res.status(404).json({ error: 'No service types found for the given advisor ID.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the service types.' });
    }
});

/**
 * @swagger
 * /investor/{investor_id}:
 *   get:
 *     summary: Get service types by investor ID
 *     tags: [Service]
 *     description: Retrieve service types associated with a specific investor by the investor's ID.
 *     parameters:
 *       - in: path
 *         name: investor_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the investor.
 *     responses:
 *       200:
 *         description: A list of service types associated with the investor.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   service_id:
 *                     type: integer
 *                   service_type_name:
 *                     type: string
 *                   is_active:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Investor not found or no associated service types.
 *       500:
 *         description: An error occurred while fetching the service types.
 */
router.get('/investor/:investor_id', async (req, res) => {
    const { investor_id } = req.params;
    try {
        const investorServices = await InvestorService.findAll({ where: { investor_id } });
        if (investorServices.length > 0) {
            const serviceIds = investorServices.map(is => is.service_id);
            const serviceTypes = await ServiceType.findAll({ where: { service_id: serviceIds } });
            res.json(serviceTypes);
        } else {
            res.status(404).json({ error: 'No service types found for the given investor ID.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the service types.' });
    }
});




module.exports = router;
