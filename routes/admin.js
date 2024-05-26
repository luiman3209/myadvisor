const express = require('express');
const { User, Advisor, Review } = require('../models/models');
const passport = require('passport');

const router = express.Router();

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

// Get all users
router.get('/users', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a user
router.put('/users/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await user.update(req.body);
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a user
router.delete('/users/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all advisors
router.get('/advisors', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const advisors = await Advisor.findAll({ include: User });
        res.json(advisors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an advisor
router.put('/advisors/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const advisor = await Advisor.findByPk(req.params.id);
        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }
        const updatedAdvisor = await advisor.update(req.body);
        res.json(updatedAdvisor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an advisor
router.delete('/advisors/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const advisor = await Advisor.findByPk(req.params.id);
        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }
        await advisor.destroy();
        res.json({ message: 'Advisor deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all reviews
router.get('/reviews', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const reviews = await Review.findAll({ include: [User, Advisor] });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a review
router.delete('/reviews/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        await review.destroy();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get analytics
router.get('/analytics', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        // Example analytics
        const userCount = await User.count();
        const advisorCount = await Advisor.count();
        const appointmentCount = await Appointment.count();

        const recentActivities = await Appointment.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [User, Advisor],
        });

        res.json({
            userCount,
            advisorCount,
            appointmentCount,
            recentActivities,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
