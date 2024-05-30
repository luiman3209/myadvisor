


import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { Appointment, Advisor, Review, User } from '../models/models.js';
import app from '../app.js'; // Ensure this points to where your Express app is exported
import passport from 'passport';
import { expect } from 'chai';

chai.use(chaiHttp);

describe('Dashboard Routes', () => {
    beforeEach(() => {
        sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
            return (req, res, next) => {
                req.user = { id: 1 }; // Mock user
                next();
            };
        });

        sinon.stub(Appointment, 'findAll');
        sinon.stub(Advisor, 'findOne');
        sinon.stub(Review, 'findAll');
    });

    afterEach(() => {
        passport.authenticate.restore();
        Appointment.findAll.restore();
        Advisor.findOne.restore();
        Review.findAll.restore();
    });

    describe('GET /dashboard/user', () => {
        it('should return the user dashboard data', async () => {
            const mockAppointments = [{ id: 1, start_time: new Date(), Advisor: { User: { email: 'advisor@example.com' } } }];
            const mockAdvisors = [{ id: 1, Advisor: { User: { email: 'advisor@example.com' } } }];
            const mockActivity = [{ id: 1, created_at: new Date(), Advisor: { User: { email: 'advisor@example.com' } } }];

            Appointment.findAll.onFirstCall().resolves(mockAppointments);
            Appointment.findAll.onSecondCall().resolves(mockAdvisors);
            Review.findAll.resolves(mockActivity);

            const res = await chai.request(app)
                .get('/dashboard/user')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(200);
            expect(res.body.upcomingAppointments).to.deep.equal(mockAppointments);
            expect(res.body.bookedAdvisors).to.deep.equal(mockAdvisors);
            expect(res.body.recentActivity).to.deep.equal(mockActivity);
        });

        it('should return 500 if there is a server error', async () => {
            Appointment.findAll.rejects(new Error('Database error'));

            const res = await chai.request(app)
                .get('/dashboard/user')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });

    describe('GET /dashboard/advisor', () => {
        it('should return the advisor dashboard data', async () => {
            const mockAdvisor = { advisor_id: 1 };
            const mockAppointments = [{ id: 1, start_time: new Date(), User: { email: 'user@example.com' } }];
            const mockInteractions = [{ id: 1, start_time: new Date(), User: { email: 'user@example.com' } }];
            const mockProfileViews = [{ profile_views: 100 }];

            Advisor.findOne.resolves(mockAdvisor);
            Appointment.findAll.onFirstCall().resolves(mockAppointments);
            Appointment.findAll.onSecondCall().resolves(mockInteractions);
            Advisor.findAll.resolves(mockProfileViews);

            const res = await chai.request(app)
                .get('/dashboard/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(200);
            expect(res.body.upcomingAppointments).to.deep.equal(mockAppointments);
            expect(res.body.clientInteractions).to.deep.equal(mockInteractions);
            expect(res.body.profileViews).to.deep.equal(mockProfileViews);
        });

        it('should return 404 if advisor profile is not found', async () => {
            Advisor.findOne.resolves(null);

            const res = await chai.request(app)
                .get('/dashboard/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(404);
            expect(res.body.message).to.equal('Advisor profile not found');
        });

        it('should return 500 if there is a server error', async () => {
            Advisor.findOne.rejects(new Error('Database error'));

            const res = await chai.request(app)
                .get('/dashboard/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });
});
