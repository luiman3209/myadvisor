const express = require('express');
const router = express.Router();
const { ServiceType } = require('../models/models');

/**
 * @swagger
 * /service:
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
 * /service/{id}:
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






module.exports = router;
