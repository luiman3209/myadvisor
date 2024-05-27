const request = require('supertest');
const { Appointment, Advisor, User } = require('../models/models');
const app = require('../app'); // Ensure this points to where your Express app is exported
const passport = require('passport');
const { sendEmail } = require('../utils/notification');
const { calculateFreeWindows } = require('../utils/schedule');


jest.mock('../utils/notification', () => ({
    sendEmail: jest.fn(),
}));

jest.mock('../utils/schedule', () => ({
    calculateFreeWindows: jest.fn(),
}));

describe('Appointment Routes', () => {
    beforeEach(() => {
        passport.authenticate.mockImplementation((strategy, options, callback) => {
            return (req, res, next) => {
                req.user = { id: 1 }; // Mock user
                next();
            };
        });

        jest.spyOn(Appointment, 'create').mockResolvedValue();
        jest.spyOn(Appointment, 'findAll').mockResolvedValue();
        jest.spyOn(Appointment, 'findByPk').mockResolvedValue();
        jest.spyOn(Advisor, 'findByPk').mockResolvedValue();
        jest.spyOn(Advisor, 'findOne').mockResolvedValue();
        jest.spyOn(User, 'findByPk').mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('POST /appointment/book', () => {
        it('should book an appointment and send confirmation emails', async () => {
            const mockAppointment = { id: 1, user_id: 1, advisor_id: 1, start_time: '2024-06-01T10:00:00Z', end_time: '2024-06-01T11:00:00Z', status: 'scheduled' };
            const mockAdvisor = { id: 1, User: { email: 'advisor@example.com' } };
            const mockUser = { id: 1, email: 'user@example.com' };

            Appointment.create.mockResolvedValue(mockAppointment);
            Advisor.findByPk.mockResolvedValue(mockAdvisor);
            User.findByPk.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/appointment/book')
                .set('Authorization', 'Bearer mockToken')
                .send({ advisor_id: 1, start_time: '2024-06-01T10:00:00Z', end_time: '2024-06-01T11:00:00Z' });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Appointment booked successfully');
            expect(res.body.appointment).toEqual(mockAppointment);
        });

        it('should return 500 if there is a server error', async () => {
            Appointment.create.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .post('/appointment/book')
                .set('Authorization', 'Bearer mockToken')
                .send({ advisor_id: 1, start_time: '2024-06-01T10:00:00Z', end_time: '2024-06-01T11:00:00Z' });

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });

    describe('GET /appointment/user', () => {
        it('should return all appointments for the authenticated user', async () => {
            const mockAppointments = [{ id: 1, user_id: 1, advisor_id: 1, start_time: '2024-06-01T10:00:00Z', end_time: '2024-06-01T11:00:00Z', status: 'scheduled' }];
            Appointment.findAll.mockResolvedValue(mockAppointments);

            const res = await request(app)
                .get('/appointment/user')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockAppointments);
        });

        it('should return 500 if there is a server error', async () => {
            Appointment.findAll.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .get('/appointment/user')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });

    describe('GET /appointment/advisor', () => {
        it('should return all appointments for the authenticated advisor', async () => {
            const mockAdvisor = { id: 1, user_id: 1 };
            const mockAppointments = [{ id: 1, user_id: 1, advisor_id: 1, start_time: '2024-06-01T10:00:00Z', end_time: '2024-06-01T11:00:00Z', status: 'scheduled' }];
            Advisor.findOne.mockResolvedValue(mockAdvisor);
            Appointment.findAll.mockResolvedValue(mockAppointments);

            const res = await request(app)
                .get('/appointment/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockAppointments);
        });

        it('should return 404 if advisor profile is not found', async () => {
            Advisor.findOne.mockResolvedValue(null);

            const res = await request(app)
                .get('/appointment/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Advisor profile not found');
        });

        it('should return 500 if there is a server error', async () => {
            Advisor.findOne.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .get('/appointment/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });

    describe('PUT /appointment/:appointmentId/status', () => {
        it('should update the appointment status', async () => {
            const mockAppointment = { id: 1, user_id: 1, advisor_id: 1, status: 'scheduled', update: jest.fn().mockResolvedValue() };
            Appointment.findByPk.mockResolvedValue(mockAppointment);

            const res = await request(app)
                .put('/appointment/1/status')
                .set('Authorization', 'Bearer mockToken')
                .send({ status: 'completed' });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Appointment status updated successfully');
        });

        it('should return 404 if the appointment is not found', async () => {
            Appointment.findByPk.mockResolvedValue(null);

            const res = await request(app)
                .put('/appointment/1/status')
                .set('Authorization', 'Bearer mockToken')
                .send({ status: 'completed' });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Appointment not found');
        });

        it('should return 500 if there is a server error', async () => {
            Appointment.findByPk.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .put('/appointment/1/status')
                .set('Authorization', 'Bearer mockToken')
                .send({ status: 'completed' });

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });

    describe('GET /appointment/free-windows/:advisorId', () => {
        it('should return free time windows for the given advisor ID', async () => {
            const mockAdvisor = { id: 1, start_shift_1: '09:00:00', end_shift_1: '12:00:00', start_shift_2: '13:00:00', end_shift_2: '17:00:00' };
            const mockAppointments = [{ id: 1, advisor_id: 1, start_time: '2024-06-01T10:00:00Z', end_time: '2024-06-01T11:00:00Z' }];
            Advisor.findByPk.mockResolvedValue(mockAdvisor);
            Appointment.findAll.mockResolvedValue(mockAppointments);
            calculateFreeWindows.mockReturnValue(['09:00:00-10:00:00', '11:00:00-12:00:00']);

            const res = await request(app)
                .get('/appointment/free-windows/1');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ freeWindowsShift1: ['09:00:00-10:00:00', '11:00:00-12:00:00'], freeWindowsShift2: ['13:00:00-17:00:00'] });
        });

        it('should return 500 if there is a server error', async () => {
            Advisor.findByPk.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .get('/appointment/free-windows/1');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });
});
