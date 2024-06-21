const express = require('express');
const router = express.Router();
const { Qualification } = require('../models/models');


router.get('/', async (req, res) => {
    try {

        const qualifications = await Qualification.findAll();
        res.json(qualifications);
    } catch (error) {

        res.status(500).json({ error });
    }
});





module.exports = router;
