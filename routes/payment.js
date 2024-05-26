//const express = require('express');
//const stripe = require('stripe')('your-stripe-secret-key');
//const { Payment } = require('../models/models');
//
//const router = express.Router();
//
//// Webhook to handle payment status updates
//router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
//    const sig = req.headers['stripe-signature'];
//
//    let event;
//    try {
//        event = stripe.webhooks.constructEvent(req.body, sig, 'your-stripe-webhook-secret');
//    } catch (err) {
//        return res.status(400).send(`Webhook Error: ${err.message}`);
//    }
//
//    if (event.type === 'payment_intent.succeeded') {
//        const paymentIntent = event.data.object;
//
//        const payment = await Payment.findOne({ where: { stripe_payment_intent_id: paymentIntent.id } });
//        if (payment) {
//            payment.payment_status = 'completed';
//            await payment.save();
//        }
//    } else if (event.type === 'payment_intent.payment_failed') {
//        const paymentIntent = event.data.object;
//
//        const payment = await Payment.findOne({ where: { stripe_payment_intent_id: paymentIntent.id } });
//        if (payment) {
//            payment.payment_status = 'failed';
//            await payment.save();
//        }
//    }
//
//    res.json({ received: true });
//});
//
//module.exports = router;
