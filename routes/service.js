const express = require('express');
const router = express.Router();
const { ServiceType } = require('../models/models');
const { validationResult, param } = require('express-validator');

// Validation middleware
const getServiceTypeValidationRules = [
    param('id').isInt().withMessage('Service type ID must be an integer'),
];

router.get('/', async (req, res) => {
    try {
        const serviceTypes = await ServiceType.findAll();
        res.json(serviceTypes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching service types.' });
    }
});

router.get('/:id', getServiceTypeValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    try {
        const serviceType = await ServiceType.findByPk(id);
        if (serviceType) {
            res.json(serviceType);
        } else {
            res.status(404).json({ error: 'Service type not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the service type.' });
    }
});

module.exports = router;
