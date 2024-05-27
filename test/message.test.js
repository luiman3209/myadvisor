const request = require('supertest');
const { Message, User } = require('../models/models');
const app = require('../app'); 



describe('Message Routes', () => {
    beforeEach(() => {


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

            expect(res.body.message).toEqual(mockMessage);
        });

    });

    describe('GET /message/:receiver_id', () => {
        it('should return messages between two users', async () => {
            let created_at1 = new Date();
            created_at1 = created_at1.toString();
            let created_at2 = new Date();
            created_at2 = created_at2.toString();
            const mockMessages = [
                { id: 1, sender_id: 1, receiver_id: 2, content: 'Hello!', Sender: { email: 'sender@example.com' }, Receiver: { email: 'receiver@example.com' }, sent_at: created_at1 },
                { id: 2, sender_id: 2, receiver_id: 1, content: 'Hi!', Sender: { email: 'receiver@example.com' }, Receiver: { email: 'sender@example.com' }, sent_at: created_at2}
            ];

            Message.findAll.mockResolvedValue(mockMessages);

            const res = await request(app)
                .get('/message/2')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockMessages);
        });


    });
});
