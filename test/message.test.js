const request = require('supertest');
const { Message, User } = require('../models/models');
const app = require('../app'); // Ensure this points to where your Express app is exported
const passport = require('passport');
const { Op } = require('sequelize');

jest.mock('passport', () => ({
    authenticate: jest.fn(),
}));

describe('Message Routes', () => {
    beforeEach(() => {
        passport.authenticate.mockImplementation((strategy, options, callback) => {
            return (req, res, next) => {
                req.user = { id: 1 }; // Mock user
                next();
            };
        });

        jest.spyOn(Message, 'create').mockResolvedValue();
        jest.spyOn(Message, 'findAll').mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('POST /message', () => {
        it('should send a message', async () => {
            const mockMessage = { id: 1, sender_id: 1, receiver_id: 2, content: 'Hello!' };

            Message.create.mockResolvedValue(mockMessage);

            const res = await request(app)
                .post('/message')
                .set('Authorization', 'Bearer mockToken')
                .send({ receiver_id: 2, content: 'Hello!' });

            expect(res.status).toBe(200);
            expect(res.body.message).toEqual('Message sent successfully');
            expect(res.body.message).toEqual(mockMessage);
        });

        it('should return 500 if there is a server error', async () => {
            Message.create.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .post('/message')
                .set('Authorization', 'Bearer mockToken')
                .send({ receiver_id: 2, content: 'Hello!' });

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });

    describe('GET /message/:receiver_id', () => {
        it('should return messages between two users', async () => {
            const mockMessages = [
                { id: 1, sender_id: 1, receiver_id: 2, content: 'Hello!', Sender: { email: 'sender@example.com' }, Receiver: { email: 'receiver@example.com' }, sent_at: new Date() },
                { id: 2, sender_id: 2, receiver_id: 1, content: 'Hi!', Sender: { email: 'receiver@example.com' }, Receiver: { email: 'sender@example.com' }, sent_at: new Date() }
            ];

            Message.findAll.mockResolvedValue(mockMessages);

            const res = await request(app)
                .get('/message/2')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockMessages);
        });

        it('should return 500 if there is a server error', async () => {
            Message.findAll.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .get('/message/2')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });
});
