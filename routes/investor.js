const express = require('express');
const passport = require('passport');
const { Investor, User, Profile } = require('../models/models');
const { ServiceType, InvestorService } = require('../models/models');
const router = express.Router();
const xss = require('xss');

router.put('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { net_worth, income_range, geo_preferences, selected_service_ids } = req.body;
    const user_id = req.user.id;

    if (!user_id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Sanitize inputs
        const sanitizedNetWorth = xss(net_worth);
        const sanitizedIncomeRange = xss(income_range);
        const sanitizedGeoPreferences = xss(geo_preferences);

        let investor = await Investor.findOne({ where: { user_id } });

        if (investor) {
            // Update existing investor
            investor.net_worth = sanitizedNetWorth;
            investor.income_range = sanitizedIncomeRange;
            investor.geo_preferences = sanitizedGeoPreferences;
            investor.updated_at = new Date();
        } else {
            // Create new investor
            investor = await Investor.create({
                user_id,
                net_worth: sanitizedNetWorth,
                income_range: sanitizedIncomeRange,
                geo_preferences: sanitizedGeoPreferences
            });
        }

        await investor.save();

        // Update investor service types
        if (selected_service_ids && Array.isArray(selected_service_ids)) {
            await InvestorService.destroy({ where: { investor_id: investor.investor_id } });
            const investorServices = selected_service_ids.map(service_id => ({
                investor_id: investor.investor_id,
                service_id: xss(service_id)
            }));
            await InvestorService.bulkCreate(investorServices);
        }

        res.json({ message: 'Investor profile created or updated successfully', investor });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const investor = await Investor.findOne({
            where: { user_id: req.user.id },
            include: [{ model: User, attributes: ['email', 'created_at'] }],
        });

        if (!investor) {
            return res.status(404).json({ message: 'Investor not found' });
        }

        const userProfile = await Profile.findOne({ where: { user_id: req.user.id } });

        // Fetch service types for the investor
        const investorServices = await InvestorService.findAll({ where: { investor_id: investor.investor_id } });
        const serviceIds = investorServices.map(is => is.service_id);
        const serviceTypes = await ServiceType.findAll({ where: { service_id: serviceIds } });

        res.json({ investor, userProfile, serviceTypes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
