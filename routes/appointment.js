const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');

const { Appointment, Advisor, User, Profile } = require('../models/models');
const { retrieveFreeWindows } = require('../utils/bookingUtils');

const router = express.Router();

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


router.post('/filter', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { sort_type, min_date, max_date, service_id, page, limit } = req.body;


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


        if (!page || page < 1) page = 1;
        if (!limit || limit < 1 || limit > 50) limit = 10;

        const offset = (page - 1) * limit;

        if (service_id) whereClause.service_id = service_id;
        if (min_date) whereClause.start_time = { [Op.gte]: min_date };
        if (max_date) whereClause.start_time = { [Op.lte]: max_date };

        let orderClause;
        if (sort_type && (sort_type === 'asc' || sort_type === 'desc')) { orderClause = [['start_time', sort_type]]; }
        else {
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


router.put('/:appointmentId/status', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { status } = req.body;
        const { appointmentId } = req.params;

        const appointment = await Appointment.findByPk(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.user_id !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this appointment' });
        }

        await appointment.update({ status });
        res.json({ message: 'Appointment status updated successfully', appointment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


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


router.delete('/:appointmentId', passport.authenticate('jwt', { session: false }), async (req, res) => {

    try {
        const appointmentId = parseInt(req.params.appointmentId);

        const user_id = req.user.id;

        const appointment = await Appointment.findByPk(appointmentId, { include: { model: Advisor, include: { model: User } } });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.user_id !== user_id && appointment.advisor.user_config.user_id !== user_id) {
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
