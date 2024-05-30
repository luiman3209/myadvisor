const express = require('express');
const passport = require('passport');

const { Appointment, Advisor, User } = require('../models/models');
const { sendEmail } = require('../utils/notification');
const { calculateFreeWindows } = require('../utils/schedule');

const router = express.Router();
const minFreeWindowDuration = 30; // Minimum free window duration in minutes

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
        const { advisor_id, start_time, end_time } = req.body;
        const user_id = req.user.id;

        const appointment = await Appointment.create({
            user_id,
            advisor_id,
            start_time,
            end_time,
            status: 'scheduled',
        });

        const advisor = await Advisor.findByPk(advisor_id, { include: User });
        const user = await User.findByPk(user_id);

        await sendEmail(advisor.User.email, 'New Appointment Scheduled', `You have a new appointment scheduled with ${user.email} at ${start_time}.`);
        await sendEmail(user.email, 'Appointment Confirmation', `Your appointment with ${advisor.User.email} is scheduled for ${start_time}.`);

        res.json({
            message: 'Appointment booked successfully',
            appointment,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /appointment/user:
 *   get:
 *     summary: Get all appointments for a user
 *     tags:
 *       - Appointment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of appointments for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   advisor_id:
 *                     type: integer
 *                     example: 1
 *                   start_time:
 *                     type: string
 *                     format: date-time
 *                     example: '2023-01-01T10:00:00Z'
 *                   end_time:
 *                     type: string
 *                     format: date-time
 *                     example: '2023-01-01T11:00:00Z'
 *                   status:
 *                     type: string
 *                     example: 'scheduled'
 */
router.get('/user', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const appointments = await Appointment.findAll({ where: { user_id: req.user.id } });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
 *     responses:
 *       200:
 *         description: A list of appointments for the advisor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   advisor_id:
 *                     type: integer
 *                     example: 1
 *                   start_time:
 *                     type: string
 *                     format: date-time
 *                     example: '2023-01-01T10:00:00Z'
 *                   end_time:
 *                     type: string
 *                     format: date-time
 *                     example: '2023-01-01T11:00:00Z'
 *                   status:
 *                     type: string
 *                     example: 'scheduled'
 */
router.get('/advisor', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const advisor = await Advisor.findOne({ where: { user_id: req.user.id } });
        if (!advisor) {
            return res.status(404).json({ message: 'Advisor profile not found' });
        }

        const appointments = await Appointment.findAll({ where: { advisor_id: advisor.advisor_id } });
        res.json(appointments);
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

        await appointment.update({ status });
        res.json({ message: 'Appointment status updated successfully', appointment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /appointment/free-windows/{advisorId}:
 *   get:
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
 *     responses:
 *       200:
 *         description: Free time windows for the advisor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 freeWindowsShift1:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date-time
 *                         example: '2023-01-01T10:00:00Z'
 *                       end:
 *                         type: string
 *                         format: date-time
 *                         example: '2023-01-01T11:00:00Z'
 *                 freeWindowsShift2:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date-time
 *                         example: '2023-01-01T15:00:00Z'
 *                       end:
 *                         type: string
 *                         format: date-time
 *                         example: '2023-01-01T16:00:00Z'
 */
router.get('/free-windows/:advisorId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const advisorId = req.params.advisorId;

        // Fetch working hours for the advisor from the database
        const advisor = await Advisor.findByPk(advisorId);

        // Example working hours and appointment duration (in minutes)
        let workingHours = {
            start: advisor.start_shift_1,
            end: advisor.end_shift_1,
        };

        // Fetch existing appointments for the advisor
        const appointments = await Appointment.findAll({
            where: { advisor_id: advisorId },
            order: [['start_time', 'ASC']],
        });

        // Calculate free time windows
        let freeWindowsShift1 = calculateFreeWindows(appointments, workingHours, minFreeWindowDuration);

        if (advisor.start_shift_2 && advisor.end_shift_2) {
            workingHours = {
                start: advisor.start_shift_2,
                end: advisor.end_shift_2,
            };
            let freeWindowsShift2 = calculateFreeWindows(appointments, workingHours, minFreeWindowDuration);
            res.json({ freeWindowsShift1, freeWindowsShift2 });
        } else {
            res.json({ freeWindowsShift1 });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
