
import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { Message, User } from '../models/models.js';
import app from '../app.js'; // Ensure this points to where your Express app is exported
import passport from 'passport';
import { expect } from 'chai';

chai.use(chaiHttp);

describe('Message Routes', () => {
    beforeEach(() => {
        sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
            return (req, res, next) => {
                req.user = { id: 1 }; // Mock user
                next();
            };
        });

        sinon.stub(Message, 'create');
        sinon.stub(Message, 'findAll');
    });

    afterEach(() => {
        passport.authenticate.restore();
        Message.create.restore();
        Message.findAll.restore();
    });

    describe('POST /message', () => {
        it('should send a message', async () => {
            const mockMessage = { id: 1, sender_id: 1, receiver_id: 2, content: 'Hello!' };

            Message.create.resolves(mockMessage);

            const res = await chai.request(app)
                .post('/message')
                .set('Authorization', 'Bearer mockToken')
                .send({ receiver_id: 2, content: 'Hello!' });

            expect(res).to.have.status(200);
            expect(res.body.message).to.equal('Message sent successfully');
            expect(res.body.message).to.deep.equal(mockMessage);
        });

        it('should return 500 if there is a server error', async () => {
            Message.create.rejects(new Error('Database error'));

            const res = await chai.request(app)
                .post('/message')
                .set('Authorization', 'Bearer mockToken')
                .send({ receiver_id: 2, content: 'Hello!' });

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });

    describe('GET /message/:receiver_id', () => {
        it('should return messages between two users', async () => {
            const mockMessages = [
                { id: 1, sender_id: 1, receiver_id: 2, content: 'Hello!', Sender: { email: 'sender@example.com' }, Receiver: { email: 'receiver@example.com' }, sent_at: new Date() },
                { id: 2, sender_id: 2, receiver_id: 1, content: 'Hi!', Sender: { email: 'receiver@example.com' }, Receiver: { email: 'sender@example.com' }, sent_at: new Date() }
            ];

            Message.findAll.resolves(mockMessages);

            const res = await chai.request(app)
                .get('/message/2')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal(mockMessages);
        });

        it('should return 500 if there is a server error', async () => {
            Message.findAll.rejects(new Error('Database error'));

            const res = await chai.request(app)
                .get('/message/2')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });
});
