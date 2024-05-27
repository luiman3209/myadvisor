const express = require('express');
const passport = require('passport');
const { Message, User, Advisor } = require('../models/models');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a message
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiver_id:
 *                 type: integer
 *                 example: 2
 *               content:
 *                 type: string
 *                 example: "Hello, how are you?"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Message sent successfully"
 *                 messageValue:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     sender_id:
 *                       type: integer
 *                       example: 1
 *                     receiver_id:
 *                       type: integer
 *                       example: 2
 *                     content:
 *                       type: string
 *                       example: "Hello, how are you?"
 *                     sent_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T10:00:00Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { receiver_id, content } = req.body;
        const sender_id = req.user.id;

        const message = await Message.create({
            sender_id,
            receiver_id,
            content,
        });

        res.json({ message: 'Message sent successfully', messageValue: message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /messages/{receiver_id}:
 *   get:
 *     summary: Get messages between two users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiver_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The receiver ID
 *     responses:
 *       200:
 *         description: A list of messages between two users
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
 *                   sender_id:
 *                     type: integer
 *                     example: 1
 *                   receiver_id:
 *                     type: integer
 *                     example: 2
 *                   content:
 *                     type: string
 *                     example: "Hello, how are you?"
 *                   sent_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-01-01T10:00:00Z"
 *                   Sender:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                         example: "sender@example.com"
 *                   Receiver:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                         example: "receiver@example.com"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
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
