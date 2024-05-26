const express = require('express');
const passport = require('passport');
const { Advisor, Review, Profile, User } = require('../models/models');

const router = express.Router();

// Get detailed advisor profile
router.get('/', async (req, res) => {
    try {
        // Find the advisor using the user_id
        const advisor = await Advisor.findOne({
            where: { user_id: req.user.id },
            include: [
                {
                    model: Profile,
                    include: [{ model: User, attributes: ['email', 'created_at'] }],
                },
                {
                    model: Review,
                    include: [{ model: User, attributes: ['email'] }],
                },
            ],
        });

        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }

        // Fetch reviews for the advisor
        const profileReviews = await Review.findAll({
            where: { advisor_id: advisor.id }, // Assuming the Review model has advisor_id that refers to Advisor model
            include: [{ model: User, attributes: ['email'] }],
        });

        res.json({
            advisor,
            profileReviews,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get detailed advisor profile
router.get('/:advisorId', async (req, res) => {
    try {
        const advisor = await Advisor.findByPk(req.params.advisorId, {
            include: [
                {
                    model: Profile,
                    include: [{ model: User, attributes: ['email', 'created_at'] }],
                },
                {
                    model: Review,
                    include: [{ model: User, attributes: ['email'] }],
                },
            ],
        });

        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }

        const profileReviews = await Review.findAll({
            where: { advisor_id: req.params.advisorId },
            include: [{ model: User, attributes: ['email'] }],
        });

        res.json({
            advisor,
            profileReviews,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Leave a review for an advisor
router.post('/:advisorId/review', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { rating, review } = req.body;
        const { advisorId } = req.params;
        const userId = req.user.id;

        const newReview = await Review.create({
            user_id: userId,
            advisor_id: advisorId,
            rating,
            review,
        });

        res.json({ message: 'Review added successfully', review: newReview });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:advisorId/contact', async (req, res) => {
    try {
        const advisor = await Advisor.findByPk(req.params.advisorId, {
            include: [{ model: User, attributes: ['email'] }],
        });

        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }

        res.json({
            email: advisor.User.email,
            contactInformation: advisor.contact_information,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
