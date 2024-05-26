const express = require('express');
const passport = require('passport');
const { Appointment, Advisor, Review, Profile, User } = require('../models/models');

const router = express.Router();

// User Dashboard: Overview of user’s upcoming appointments, booked advisors, and recent activity
router.get('/user', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userId = req.user.id;

        const upcomingAppointments = await Appointment.findAll({
            where: {
                user_id: userId,
                start_time: {
                    [Op.gte]: new Date(),
                },
            },
            include: [{
                model: Advisor,
                include: [{ model: User, attributes: ['email'] }],
            }],
            order: [['start_time', 'ASC']],
        });

        const bookedAdvisors = await Appointment.findAll({
            where: {
                user_id: userId,
            },
            include: [{
                model: Advisor,
                include: [{ model: User, attributes: ['email'] }],
            }],
            group: ['advisor_id'],
        });

        const recentActivity = await Review.findAll({
            where: {
                user_id: userId,
            },
            include: [{
                model: Advisor,
                include: [{ model: User, attributes: ['email'] }],
            }],
            order: [['created_at', 'DESC']],
            limit: 5,
        });

        res.json({
            upcomingAppointments,
            bookedAdvisors,
            recentActivity,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/advisor', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const advisor = await Advisor.findOne({ where: { user_id: req.user.id } });
        if (!advisor) {
            return res.status(404).json({ message: 'Advisor profile not found' });
        }

        const advisorId = advisor.advisor_id;

        const upcomingAppointments = await Appointment.findAll({
            where: {
                advisor_id: advisorId,
                start_time: {
                    [Op.gte]: new Date(),
                },
            },
            include: [{
                model: User,
                attributes: ['email'],
            }],
            order: [['start_time', 'ASC']],
        });

        const clientInteractions = await Appointment.findAll({
            where: {
                advisor_id: advisorId,
            },
            include: [{
                model: User,
                attributes: ['email'],
            }],
            order: [['start_time', 'DESC']],
            limit: 5,
        });

        const profileViews = await Advisor.findAll({
            where: {
                advisor_id: advisorId,
            },
            attributes: ['profile_views'], // Assuming there's a profile_views column
        });

        res.json({
            upcomingAppointments,
            clientInteractions,
            profileViews,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
