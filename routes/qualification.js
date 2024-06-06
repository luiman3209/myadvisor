const express = require('express');
const router = express.Router();
const { Qualification, AdvisorQualification } = require('../models/models');

/**
 * @swagger
 * tags:
 *   name: Qualification
 *   description: Qualification type management
 */

/**
 * @swagger
 * /service:
 *   get:
 *     summary: Get all qualifications
 *     tags: [Qualification]
 *     description: Retrieve a list of all qualifications.
 *     responses:
 *       200:
 *         description: A list of qualifications.
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
 *         description: An error occurred while fetching qualifications.
 */
router.get('/', async (req, res) => {
    try {
        console.log('Fetching qualifications')
        const serviceTypes = await Qualification.findAll();
        res.json(serviceTypes);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while fetching qualifications.' });
    }
});

/**
 * @swagger
 * /service/{id}:
 *   get:
 *     summary: Get a service type by ID
 *     tags: [Qualification]
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
 *         description: Qualification type not found.
 *       500:
 *         description: An error occurred while fetching the service type.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const serviceType = await Qualification.findByPk(id);
        if (serviceType) {
            res.json(serviceType);
        } else {
            res.status(404).json({ error: 'Qualification type not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the service type.' });
    }
});

/**
 * @swagger
 * /advisor/{advisor_id}:
 *   get:
 *     summary: Get qualifications by advisor ID
 *     tags: [Qualification]
 *     description: Retrieve qualifications associated with a specific advisor by the advisor's ID.
 *     parameters:
 *       - in: path
 *         name: advisor_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the advisor.
 *     responses:
 *       200:
 *         description: A list of qualifications associated with the advisor.
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
 *         description: Advisor not found or no associated qualifications.
 *       500:
 *         description: An error occurred while fetching the qualifications.
 */
router.get('/advisor/:advisor_id', async (req, res) => {
    const { advisor_id } = req.params;
    try {
        const advisorQualifications = await AdvisorQualification.findAll({ where: { advisor_id } });
        if (advisorQualifications.length > 0) {
            const qualificationIds = advisorQualifications.map(as => as.qualification_id);
            const qualifications = await Qualification.findAll({ where: { qualification_id: qualificationIds } });
            res.json(qualifications);
        } else {
            res.status(404).json({ error: 'No qualifications found for the given advisor ID.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the qualifications.' });
    }
});






module.exports = router;
