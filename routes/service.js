const express = require('express');
const router = express.Router();
const { ServiceType } = require('../models/models');


router.get('/', async (req, res) => {
    try {
        const serviceTypes = await ServiceType.findAll();
        res.json(serviceTypes);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching service types.' });
    }
});


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
