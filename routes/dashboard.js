const express = require('express');
const passport = require('passport');
const { Appointment, Advisor, Review, Profile, User } = require('../models/models');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * /dashboard/user:
 *   get:
 *     summary: User Dashboard - Overview of user’s upcoming appointments, booked advisors, and recent activity
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 upcomingAppointments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       start_time:
 *                         type: string
 *                         format: date-time
 *                         example: '2023-01-01T10:00:00Z'
 *                       end_time:
 *                         type: string
 *                         format: date-time
 *                         example: '2023-01-01T11:00:00Z'
 *                       status:
 *                         type: string
 *                         example: 'scheduled'
 *                       advisor:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           user_id:
 *                             type: integer
 *                             example: 1
 *                           specialty:
 *                             type: string
 *                             example: 'Financial Advisor'
 *                           user:
 *                             type: object
 *                             properties:
 *                               email:
 *                                 type: string
 *                                 example: 'advisor@example.com'
 *                 bookedAdvisors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       advisor:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           user_id:
 *                             type: integer
 *                             example: 1
 *                           specialty:
 *                             type: string
 *                             example: 'Financial Advisor'
 *                           user:
 *                             type: object
 *                             properties:
 *                               email:
 *                                 type: string
 *                                 example: 'advisor@example.com'
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       advisor_id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       review:
 *                         type: string
 *                         example: 'Great advice!'
 *                       rating:
 *                         type: integer
 *                         example: 5
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: '2023-01-01T10:00:00Z'
 *                       advisor:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           user_id:
 *                             type: integer
 *                             example: 1
 *                           specialty:
 *                             type: string
 *                             example: 'Financial Advisor'
 *                           user:
 *                             type: object
 *                             properties:
 *                               email:
 *                                 type: string
 *                                 example: 'advisor@example.com'
 */
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

/**
 * @swagger
 * /dashboard/advisor:
 *   get:
 *     summary: Advisor Dashboard - Overview of advisor’s upcoming appointments, client interactions, and profile views
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Advisor dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 upcomingAppointments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       start_time:
 *                         type: string
 *                         format: date-time
 *                         example: '2023-01-01T10:00:00Z'
 *                       end_time:
 *                         type: string
 *                         format: date-time
 *                         example: '2023-01-01T11:00:00Z'
 *                       status:
 *                         type: string
 *                         example: 'scheduled'
 *                       user:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                             example: 'user@example.com'
 *                 clientInteractions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       start_time:
 *                         type: string
 *                         format: date-time
 *                         example: '2023-01-01T10:00:00Z'
 *                       end_time:
 *                         type: string
 *                         format: date-time
 *                         example: '2023-01-01T11:00:00Z'
 *                       status:
 *                         type: string
 *                         example: 'scheduled'
 *                       user:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                             example: 'user@example.com'
 *                 profileViews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       profile_views:
 *                         type: integer
 *                         example: 100
 */
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
