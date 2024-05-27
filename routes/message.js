const express = require('express');
const passport = require('passport');
const { Message, User, Advisor } = require('../models/models');
const { Op } = require('sequelize');

const router = express.Router();

// Send a message
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { receiver_id, content } = req.body;
        const sender_id = req.user.id;

        const message = await Message.create({
            sender_id,
            receiver_id,
            content,
        });

        res.json({ message: 'Message sent successfully', message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get messages between two users
router.get('/:receiver_id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { receiver_id } = req.params;
        const sender_id = req.user.id;
        
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { sender_id, receiver_id },
                    { sender_id: receiver_id, receiver_id: sender_id },
                ],
            },
            include: [
                { model: User, as: 'Sender', attributes: ['email'] },
                { model: User, as: 'Receiver', attributes: ['email'] },
            ],
            order: [['sent_at', 'ASC']],
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
