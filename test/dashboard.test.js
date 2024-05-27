const request = require('supertest');
const { Appointment, Advisor, Review, User } = require('../models/models');
const app = require('../app'); // Ensure this points to where your Express app is exported
const passport = require('passport');
const { Op } = require('sequelize');

jest.mock('passport', () => ({
    authenticate: jest.fn(),
}));

describe('Dashboard Routes', () => {
    beforeEach(() => {
        passport.authenticate.mockImplementation((strategy, options, callback) => {
            return (req, res, next) => {
                req.user = { id: 1 }; // Mock user
                next();
            };
        });

        jest.spyOn(Appointment, 'findAll').mockResolvedValue();
        jest.spyOn(Advisor, 'findOne').mockResolvedValue();
        jest.spyOn(Review, 'findAll').mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('GET /dashboard/user', () => {
        it('should return the user dashboard data', async () => {
            const mockAppointments = [{ id: 1, start_time: new Date(), Advisor: { User: { email: 'advisor@example.com' } } }];
            const mockAdvisors = [{ id: 1, Advisor: { User: { email: 'advisor@example.com' } } }];
            const mockActivity = [{ id: 1, created_at: new Date(), Advisor: { User: { email: 'advisor@example.com' } } }];

            Appointment.findAll.mockResolvedValueOnce(mockAppointments).mockResolvedValueOnce(mockAdvisors);
            Review.findAll.mockResolvedValue(mockActivity);

            const res = await request(app)
                .get('/dashboard/user')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(200);
            expect(res.body.upcomingAppointments).toEqual(mockAppointments);
            expect(res.body.bookedAdvisors).toEqual(mockAdvisors);
            expect(res.body.recentActivity).toEqual(mockActivity);
        });

        it('should return 500 if there is a server error', async () => {
            Appointment.findAll.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .get('/dashboard/user')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });

    describe('GET /dashboard/advisor', () => {
        it('should return the advisor dashboard data', async () => {
            const mockAdvisor = { advisor_id: 1 };
            const mockAppointments = [{ id: 1, start_time: new Date(), User: { email: 'user@example.com' } }];
            const mockInteractions = [{ id: 1, start_time: new Date(), User: { email: 'user@example.com' } }];
            const mockProfileViews = [{ profile_views: 100 }];

            Advisor.findOne.mockResolvedValue(mockAdvisor);
            Appointment.findAll.mockResolvedValueOnce(mockAppointments).mockResolvedValueOnce(mockInteractions);
            Advisor.findAll.mockResolvedValue(mockProfileViews);

            const res = await request(app)
                .get('/dashboard/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(200);
            expect(res.body.upcomingAppointments).toEqual(mockAppointments);
            expect(res.body.clientInteractions).toEqual(mockInteractions);
            expect(res.body.profileViews).toEqual(mockProfileViews);
        });

        it('should return 404 if advisor profile is not found', async () => {
            Advisor.findOne.mockResolvedValue(null);

            const res = await request(app)
                .get('/dashboard/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Advisor profile not found');
        });

        it('should return 500 if there is a server error', async () => {
            Advisor.findOne.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .get('/dashboard/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });
});
