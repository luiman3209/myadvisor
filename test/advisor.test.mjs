import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { Advisor, Review, Profile, User } from '../models/models.js';
import app from '../app.js'; // Ensure this points to where your Express app is exported
import passport from 'passport';
import { expect } from 'chai';

chai.use(chaiHttp);

describe('Advisor Routes', () => {
    beforeEach(() => {
        sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
            return (req, res, next) => {
                req.user = { id: 1 }; // Mock user
                next();
            };
        });

        sinon.stub(Advisor, 'findOne');
        sinon.stub(Advisor, 'findByPk');
        sinon.stub(Review, 'findAll');
        sinon.stub(Review, 'create');
    });

    afterEach(() => {
        passport.authenticate.restore();
        Advisor.findOne.restore();
        Advisor.findByPk.restore();
        Review.findAll.restore();
        Review.create.restore();
    });

    describe('GET /advisor', () => {
        it('should return the detailed advisor profile for the authenticated user', async () => {
            const mockAdvisor = {
                id: 1,
                user_id: 1,
                Profile: { User: { email: 'test@example.com', created_at: new Date() } },
                Reviews: [{ User: { email: 'reviewer@example.com' } }],
            };
            Advisor.findOne.resolves(mockAdvisor);
            Review.findAll.resolves([]);

            const res = await chai.request(app).get('/advisor');

            expect(res).to.have.status(200);
            expect(res.body.advisor).to.deep.equal(mockAdvisor);
        });

        it('should return 404 if advisor not found', async () => {
            Advisor.findOne.resolves(null);

            const res = await chai.request(app).get('/advisor');

            expect(res).to.have.status(404);
            expect(res.body.message).to.equal('Advisor not found');
        });

        it('should return 500 if there is a server error', async () => {
            Advisor.findOne.rejects(new Error('Database error'));

            const res = await chai.request(app).get('/advisor');

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });

    describe('GET /advisor/:advisorId', () => {
        it('should return the detailed advisor profile for the given advisor ID', async () => {
            const mockAdvisor = {
                id: 1,
                user_id: 1,
                Profile: { User: { email: 'test@example.com', created_at: new Date() } },
                Reviews: [{ User: { email: 'reviewer@example.com' } }],
            };
            Advisor.findByPk.resolves(mockAdvisor);
            Review.findAll.resolves([]);

            const res = await chai.request(app).get('/advisor/1');

            expect(res).to.have.status(200);
            expect(res.body.advisor).to.deep.equal(mockAdvisor);
        });

        it('should return 404 if advisor not found', async () => {
            Advisor.findByPk.resolves(null);

            const res = await chai.request(app).get('/advisor/1');

            expect(res).to.have.status(404);
            expect(res.body.message).to.equal('Advisor not found');
        });

        it('should return 500 if there is a server error', async () => {
            Advisor.findByPk.rejects(new Error('Database error'));

            const res = await chai.request(app).get('/advisor/1');

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });

    describe('POST /advisor/:advisorId/review', () => {
        it('should add a review for the advisor', async () => {
            const mockReview = { id: 1, user_id: 1, advisor_id: 1, rating: 5, review: 'Great advice!' };
            Review.create.resolves(mockReview);

            const res = await chai.request(app)
                .post('/advisor/1/review')
                .set('Authorization', 'Bearer mockToken')
                .send({ rating: 5, review: 'Great advice!' });

            expect(res).to.have.status(200);
            expect(res.body.message).to.equal('Review added successfully');
            expect(res.body.review).to.deep.equal(mockReview);
        });

        it('should return 500 if there is a server error', async () => {
            Review.create.rejects(new Error('Database error'));

            const res = await chai.request(app)
                .post('/advisor/1/review')
                .set('Authorization', 'Bearer mockToken')
                .send({ rating: 5, review: 'Great advice!' });

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });

    describe('GET /advisor/:advisorId/contact', () => {
        it('should return the contact information for the given advisor ID', async () => {
            const mockAdvisor = { id: 1, User: { email: 'advisor@example.com' }, contact_information: 'Contact Info' };
            Advisor.findByPk.resolves(mockAdvisor);

            const res = await chai.request(app).get('/advisor/1/contact');

            expect(res).to.have.status(200);
            expect(res.body.email).to.equal('advisor@example.com');
            expect(res.body.contactInformation).to.equal('Contact Info');
        });

        it('should return 404 if advisor not found', async () => {
            Advisor.findByPk.resolves(null);

            const res = await chai.request(app).get('/advisor/1/contact');

            expect(res).to.have.status(404);
            expect(res.body.message).to.equal('Advisor not found');
        });

        it('should return 500 if there is a server error', async () => {
            Advisor.findByPk.rejects(new Error('Database error'));

            const res = await chai.request(app).get('/advisor/1/contact');

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });
});
