const express = require('express');
const passport = require('passport');

const { Appointment, Advisor, User } = require('../models/models');
const { sendEmail } = require('../utils/notification');


const router = express.Router();


// Book an appointment and create a payment intent
router.post('/book', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { advisor_id, start_time, end_time } = req.body;
        const user_id = req.user.id;

        // TODO: check time before saving using calculate free windows


        const appointment = await Appointment.create({
            user_id,
            advisor_id,
            start_time,
            end_time,
            status: 'scheduled',
        });

        // Handle payment processing
        //const paymentIntent = await stripe.paymentIntents.create({
        //    amount: Math.round(amount * 100), // Stripe works with smallest currency unit
        //    currency: 'usd',
        //    payment_method_types: ['card'],
        //});

        //const payment = await Payment.create({
        //    user_id,
        //    appointment_id: appointment.appointment_id,
        //    amount,
        //    payment_method: 'card',
        //    payment_status: 'pending',
        //    stripe_payment_intent_id: paymentIntent.id,
        //});

        // Send notification email
        const advisor = await Advisor.findByPk(advisor_id, { include: User });
        const user = await User.findByPk(user_id);

        await sendEmail(advisor.User.email, 'New Appointment Scheduled', `You have a new appointment scheduled with ${user.email} at ${start_time}.`);
        await sendEmail(user.email, 'Appointment Confirmation', `Your appointment with ${advisor.User.email} is scheduled for ${start_time}.`);

        res.json({
            message: 'Appointment booked successfully',
            appointment,
            //payment,
            //clientSecret: paymentIntent.client_secret, // Return client secret for payment
        });
    } catch (error) {

        res.status(500).json({ error: error.message });
    }
});

// Get all appointments for a user
router.get('/user', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const appointments = await Appointment.findAll({ where: { user_id: req.user.id } });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all appointments for an advisor
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

// Update appointment status
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

const { calculateFreeWindows } = require('../utils/schedule');


const minFreeWindowDuration = 30; // Minimum free window duration in minutes

// Get free windows for a given advisor
router.get('/free-windows/:advisorId', async (req, res) => {
    try {
        const advisorId = req.params.advisorId;

        // TODO: Fetch working hours for the advisor from the database
        const advisor = await Advisor.findByPk(advisorId);

        // Example working hours and appointment duration (in minutes)
        let workingHours = {
            start: advisor.start_shift_1,
            end: advisor.start_shift_2,
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
            res.json({ freeWindowsShift1: freeWindowsShift1, freeWindowsShift2: freeWindowsShift2 });
        }

        res.json({ freeWindowsShift1: freeWindowsShift1 });

    } catch (error) {
        
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
