

import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { Appointment, Advisor, User } from '../models/models.js';
import app from '../app.js'; // Ensure this points to where your Express app is exported
import passport from 'passport';
import { expect } from 'chai';


chai.use(chaiHttp);

describe('Appointment Routes', () => {
    beforeEach(() => {
        sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
            return (req, res, next) => {
                req.user = { id: 1 }; // Mock user
                next();
            };
        });

        sinon.stub(Appointment, 'create');
        sinon.stub(Appointment, 'findAll');
        sinon.stub(Appointment, 'findByPk');
        sinon.stub(Advisor, 'findByPk');
        sinon.stub(Advisor, 'findOne');
        sinon.stub(User, 'findByPk');
        sinon.stub(sendEmail, 'sendEmail');
    });

    afterEach(() => {
        passport.authenticate.restore();
        Appointment.create.restore();
        Appointment.findAll.restore();
        Appointment.findByPk.restore();
        Advisor.findByPk.restore();
        Advisor.findOne.restore();
        User.findByPk.restore();
        sendEmail.sendEmail.restore();
    });

    describe('POST /appointment/book', () => {
        it('should book an appointment and send confirmation emails', async () => {
            const mockAppointment = { id: 1, user_id: 1, advisor_id: 1, start_time: '2024-06-01T10:00:00Z', end_time: '2024-06-01T11:00:00Z', status: 'scheduled' };
            const mockAdvisor = { id: 1, User: { email: 'advisor@example.com' } };
            const mockUser = { id: 1, email: 'user@example.com' };

            Appointment.create.resolves(mockAppointment);
            Advisor.findByPk.resolves(mockAdvisor);
            User.findByPk.resolves(mockUser);

            const res = await chai.request(app)
                .post('/appointment/book')
                .set('Authorization', 'Bearer mockToken')
                .send({ advisor_id: 1, start_time: '2024-06-01T10:00:00Z', end_time: '2024-06-01T11:00:00Z' });

            expect(res).to.have.status(200);
            expect(res.body.message).to.equal('Appointment booked successfully');
            expect(res.body.appointment).to.deep.equal(mockAppointment);
        });

        it('should return 500 if there is a server error', async () => {
            Appointment.create.rejects(new Error('Database error'));

            const res = await chai.request(app)
                .post('/appointment/book')
                .set('Authorization', 'Bearer mockToken')
                .send({ advisor_id: 1, start_time: '2024-06-01T10:00:00Z', end_time: '2024-06-01T11:00:00Z' });

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });

    describe('GET /appointment/user', () => {
        it('should return all appointments for the authenticated user', async () => {
            const mockAppointments = [{ id: 1, user_id: 1, advisor_id: 1, start_time: '2024-06-01T10:00:00Z', end_time: '2024-06-01T11:00:00Z', status: 'scheduled' }];
            Appointment.findAll.resolves(mockAppointments);

            const res = await chai.request(app)
                .get('/appointment/user')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal(mockAppointments);
        });

        it('should return 500 if there is a server error', async () => {
            Appointment.findAll.rejects(new Error('Database error'));

            const res = await chai.request(app)
                .get('/appointment/user')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });

    describe('GET /appointment/advisor', () => {
        it('should return all appointments for the authenticated advisor', async () => {
            const mockAdvisor = { id: 1, user_id: 1 };
            const mockAppointments = [{ id: 1, user_id: 1, advisor_id: 1, start_time: '2024-06-01T10:00:00Z', end_time: '2024-06-01T11:00:00Z', status: 'scheduled' }];
            Advisor.findOne.resolves(mockAdvisor);
            Appointment.findAll.resolves(mockAppointments);

            const res = await chai.request(app)
                .get('/appointment/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal(mockAppointments);
        });

        it('should return 404 if advisor profile is not found', async () => {
            Advisor.findOne.resolves(null);

            const res = await chai.request(app)
                .get('/appointment/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(404);
            expect(res.body.message).to.equal('Advisor profile not found');
        });

        it('should return 500 if there is a server error', async () => {
            Advisor.findOne.rejects(new Error('Database error'));

            const res = await chai.request(app)
                .get('/appointment/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });

    describe('PUT /appointment/:appointmentId/status', () => {
        it('should update the appointment status', async () => {
            const mockAppointment = { id: 1, user_id: 1, advisor_id: 1, status: 'scheduled', update: sinon.stub().resolves() };
            Appointment.findByPk.resolves(mockAppointment);

            const res = await chai.request(app)
                .put('/appointment/1/status')
                .set('Authorization', 'Bearer mockToken')
                .send({ status: 'completed' });

            expect(res).to.have.status(200);
            expect(res.body.message).to.equal('Appointment status updated successfully');
        });

        it('should return 404 if the appointment is not found', async () => {
            Appointment.findByPk.resolves(null);

            const res = await chai.request(app)
                .put('/appointment/1/status')
                .set('Authorization', 'Bearer mockToken')
                .send({ status: 'completed' });

            expect(res).to.have.status(404);
            expect(res.body.message).to.equal('Appointment not found');
        });

        it('should return 500 if there is a server error', async () => {
            Appointment.findByPk.rejects(new Error('Database error'));

            const res = await chai.request(app)
                .put('/appointment/1/status')
                .set('Authorization', 'Bearer mockToken')
                .send({ status: 'completed' });

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });

    describe('GET /appointment/free-windows/:advisorId', () => {
        it('should return free time windows for the given advisor ID', async () => {
            const mockAdvisor = { id: 1, start_shift_1: '09:00:00', end_shift_1: '12:00:00', start_shift_2: '13:00:00', end_shift_2: '17:00:00' };
            const mockAppointments = [{ id: 1, advisor_id: 1, start_time: '2024-06-01T10:00:00Z', end_time: '2024-06-01T11:00:00Z' }];
            Advisor.findByPk.resolves(mockAdvisor);
            Appointment.findAll.resolves(mockAppointments);
            sinon.stub(require('../utils/schedule'), 'calculateFreeWindows').returns(['09:00:00-10:00:00', '11:00:00-12:00:00']);

            const res = await chai.request(app)
                .get('/appointment/free-windows/1');

            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal({ freeWindowsShift1: ['09:00:00-10:00:00', '11:00:00-12:00:00'], freeWindowsShift2: ['13:00:00-17:00:00'] });

            require('../utils/schedule').calculateFreeWindows.restore();
        });

        it('should return 500 if there is a server error', async () => {
            Advisor.findByPk.rejects(new Error('Database error'));

            const res = await chai.request(app)
                .get('/appointment/free-windows/1');

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });
});
