const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');

const { Appointment, Advisor, User } = require('../models/models');
const { retrieveFreeWindows } = require('../utils/bookingUtils');

const router = express.Router();

/**
 * @swagger
 * /appointment/book:
 *   post:
 *     summary: Book an appointment and create a payment intent
 *     tags:
 *       - Appointment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               advisor_id:
 *                 type: integer
 *                 example: 1
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 example: '2023-01-01T10:00:00Z'
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 example: '2023-01-01T11:00:00Z'
 *     responses:
 *       200:
 *         description: Appointment booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Appointment booked successfully"
 *                 appointment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     advisor_id:
 *                       type: integer
 *                       example: 1
 *                     start_time:
 *                       type: string
 *                       format: date-time
 *                       example: '2023-01-01T10:00:00Z'
 *                     end_time:
 *                       type: string
 *                       format: date-time
 *                       example: '2023-01-01T11:00:00Z'
 *                     status:
 *                       type: string
 *                       example: 'scheduled'
 */
router.post('/book', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { advisor_id, service_id, start_time, end_time } = req.body;
        const user_id = req.user.id;

        // Check if the advisor is available
        const existingAppointment = await Appointment.findAll({
            where: {
                advisor_id,
                start_time,
            },
        });

        if (existingAppointment.length > 0) {
            return res.status(400).json({ message: 'Advisor is not available at this time' });
        }

        const appointment = await Appointment.create({
            user_id,
            advisor_id,
            service_id,
            start_time,
            end_time,
            is_reviewed: false,
            status: 'scheduled',
        });

        const advisor = await Advisor.findByPk(advisor_id, { include: User });
        const user = await User.findByPk(user_id);

        //await sendEmail(advisor.User.email, 'New Appointment Scheduled', `You have a new appointment scheduled with ${user.email} at ${start_time}.`);
        //await sendEmail(user.email, 'Appointment Confirmation', `Your appointment with ${advisor.User.email} is scheduled for ${start_time}.`);

        const formattedAppointment = {
            ...appointment.toJSON(),
            start_time: appointment.start_time.toISOString(),
            end_time: appointment.end_time.toISOString(),
        };

        res.json({
            message: 'Appointment booked successfully',
            appointment: formattedAppointment,
        });
    } catch (error) {
        res.status(500).json({ error: error });
    }
});


/**
 * @swagger
 * /appointment/advisor:
 *   get:
 *     summary: Get all appointments for an advisor
 *     tags:
 *       - Appointment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of appointments for the advisor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                   example: 50
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 appointments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       advisor_id:
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
 */
router.get('/advisor', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const advisor = await Advisor.findOne({ where: { user_id: req.user.id } });
        if (!advisor) {
            return res.status(404).json({ message: 'Advisor profile not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Appointment.findAndCountAll({
            where: { advisor_id: advisor.advisor_id },
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            totalItems: count,
            totalPages: totalPages,
            currentPage: page,
            appointments: rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /appointment/{appointmentId}/status:
 *   put:
 *     summary: Update appointment status
 *     tags:
 *       - Appointment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: 'completed'
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Appointment status updated successfully'
 *                 appointment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     advisor_id:
 *                       type: integer
 *                       example: 1
 *                     start_time:
 *                       type: string
 *                       format: date-time
 *                       example: '2023-01-01T10:00:00Z'
 *                     end_time:
 *                       type: string
 *                       format: date-time
 *                       example: '2023-01-01T11:00:00Z'
 *                     status:
 *                       type: string
 *                       example: 'completed'
 */
router.put('/:appointmentId/status', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { status } = req.body;
        const { appointmentId } = req.params;

        const appointment = await Appointment.findByPk(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.advisor_id !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this appointment' });
        }

        await appointment.update({ status });
        res.json({ message: 'Appointment status updated successfully', appointment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /appointment/free-windows/{advisorId}:
 *   post:
 *     summary: Get free windows for a given advisor
 *     tags:
 *       - Appointment
 *     parameters:
 *       - in: path
 *         name: advisorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The advisor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: '2024-06-01'
 *                 description: The start date to fetch free windows
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: '2024-06-30'
 *                 description: The end date to fetch free windows
 *     responses:
 *       200:
 *         description: Free time windows for the advisor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: time
 *                   example: '09:00'
 *       404:
 *         description: Advisor not found
 *       500:
 *         description: Internal server error
 */

router.post('/free-windows/:advisorId', async (req, res) => {

    try {
        const advisorId = req.params.advisorId;
        const { startDate, endDate } = req.body;



        const advisor = await Advisor.findByPk(advisorId);
        if (!advisor) {
            return res.status(404).send('Advisor not found');
        }


        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);

        end.setHours(23, 59, 59, 999);

        const appointments = await Appointment.findAll({
            where: {
                advisor_id: advisor.advisor_id,
                start_time: {
                    [Op.between]: [start, end],
                },
            },
            order: [['start_time', 'ASC']],
        });


        const freeWindows = retrieveFreeWindows(advisor, appointments, start, end);

        res.json(freeWindows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
