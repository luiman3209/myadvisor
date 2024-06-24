const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');
const xss = require('xss');

const { Appointment, Advisor, User, Profile } = require('../models/models');
const { retrieveFreeWindows } = require('../utils/bookingUtils');

const router = express.Router();

router.post('/book', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { advisor_id, service_id, start_time, end_time } = req.body;
        const user_id = req.user.id;

        // Sanitize input
        const sanitizedAdvisorId = xss(advisor_id.toString());
        const sanitizedServiceId = xss(service_id.toString());
        const sanitizedStartTime = xss(start_time);
        const sanitizedEndTime = xss(end_time);

        // Check if the advisor is available
        const existingAppointment = await Appointment.findAll({
            where: {
                advisor_id: sanitizedAdvisorId,
                start_time: sanitizedStartTime,
            },
        });

        if (existingAppointment.length > 0) {
            return res.status(400).json({ message: 'Advisor is not available at this time' });
        }

        const appointment = await Appointment.create({
            user_id,
            advisor_id: sanitizedAdvisorId,
            service_id: sanitizedServiceId,
            start_time: sanitizedStartTime,
            end_time: sanitizedEndTime,
            is_reviewed: false,
            status: 'scheduled',
        });

        const advisor = await Advisor.findByPk(sanitizedAdvisorId, { include: User });
        const user = await User.findByPk(user_id);

        //await sendEmail(advisor.User.email, 'New Appointment Scheduled', `You have a new appointment scheduled with ${user.email} at ${sanitizedStartTime}.`);
        //await sendEmail(user.email, 'Appointment Confirmation', `Your appointment with ${advisor.User.email} is scheduled for ${sanitizedStartTime}.`);

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
        res.status(500).json({ error: error.message });
    }
});

router.post('/filter', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { sort_type, min_date, max_date, service_id, page, limit } = req.body;

        // Sanitize input
        const sanitizedSortType = xss(sort_type);
        const sanitizedMinDate = xss(min_date);
        const sanitizedMaxDate = xss(max_date);
        const sanitizedServiceId = xss(service_id ? service_id.toString() : '');
        const sanitizedPage = xss(page ? page.toString() : '1');
        const sanitizedLimit = xss(limit ? limit.toString() : '10');

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let whereClause = {};

        if (user.role === 'advisor') {
            const advisor = await Advisor.findOne({ where: { user_id: req.user.id } });
            if (!advisor) {
                return res.status(404).json({ message: 'Advisor not found' });
            }

            whereClause.advisor_id = advisor.advisor_id;

        } else {
            whereClause.user_id = req.user.id;
        }

        const pageNum = parseInt(sanitizedPage, 10);
        const limitNum = parseInt(sanitizedLimit, 10);

        const offset = (pageNum - 1) * limitNum;

        if (sanitizedServiceId) whereClause.service_id = sanitizedServiceId;
        if (sanitizedMinDate) whereClause.start_time = { [Op.gte]: sanitizedMinDate };
        if (sanitizedMaxDate) whereClause.start_time = { [Op.lte]: sanitizedMaxDate };

        let orderClause;
        if (sanitizedSortType && (sanitizedSortType === 'asc' || sanitizedSortType === 'desc')) {
            orderClause = [['start_time', sanitizedSortType]];
        } else {
            orderClause = [['start_time', 'DESC']];
        }

        const { count, rows } = await Appointment.findAndCountAll({
            where: whereClause,
            order: orderClause,
            attributes: ['appointment_id', 'user_id', 'service_id', 'start_time', 'end_time', 'is_reviewed', 'status'],
            include: [{
                model: User, attributes: ['user_id',], include: {
                    model: Profile, attributes: ['first_name'],
                    required: true
                }, required: true
            },

            {
                model: Advisor, attributes: ['advisor_id', 'display_name'],
            }],
            limit: limitNum,
            offset
        });

        const totalPages = Math.ceil(count / limitNum);

        res.json({
            totalItems: count,
            totalPages: totalPages,
            currentPage: pageNum,
            appointments: rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:appointmentId/status', passport.authenticate('jwt', { session: false }), async (req, res) => {

    res.status(400).json({ message: 'Service disabled for demo' });

    try {
        const { status } = req.body;
        const { appointmentId } = req.params;

        // Sanitize input
        const sanitizedStatus = xss(status);
        const sanitizedAppointmentId = xss(appointmentId);

        const appointment = await Appointment.findByPk(sanitizedAppointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.user_id !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this appointment' });
        }

        await appointment.update({ status: sanitizedStatus });
        res.json({ message: 'Appointment status updated successfully', appointment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/free-windows/:advisorId', async (req, res) => {
    try {
        const advisorId = req.params.advisorId;
        const { startDate, endDate } = req.body;

        // Sanitize input
        const sanitizedAdvisorId = xss(advisorId);
        const sanitizedStartDate = xss(startDate);
        const sanitizedEndDate = xss(endDate);

        const advisor = await Advisor.findByPk(sanitizedAdvisorId);
        if (!advisor) {
            return res.status(404).send('Advisor not found');
        }

        const start = new Date(sanitizedStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(sanitizedEndDate);
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

router.delete('/:appointmentId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId);

        // Sanitize input
        const sanitizedAppointmentId = xss(appointmentId.toString());

        const user_id = req.user.id;

        const appointment = await Appointment.findByPk(sanitizedAppointmentId, { include: { model: Advisor, include: { model: User } } });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.user_id !== user_id && appointment.advisor.user_id !== user_id) {
            return res.status(403).json({ message: 'You are not authorized to delete this appointment' });
        }

        await appointment.destroy();

        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
