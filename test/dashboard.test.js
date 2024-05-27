const request = require('supertest');
const { Appointment, Advisor, Review, User } = require('../models/models');
const app = require('../app'); // Ensure this points to where your Express app is exported


describe('Dashboard Routes', () => {
    beforeEach(() => {
        jest.spyOn(Appointment, 'findAll').mockResolvedValue();
        jest.spyOn(Advisor, 'findOne').mockResolvedValue();
        jest.spyOn(Review, 'findAll').mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('GET /dashboard/user', () => {
        it('should return the user dashboard data', async () => {
            let created_at1 = new Date();
            created_at1 = created_at1.toString();
            const mockAppointments = [{ id: 1, start_time: created_at1, Advisor: { User: { email: 'advisor@example.com' } } }];
            const mockAdvisors = [{ id: 1, Advisor: { User: { email: 'advisor@example.com' } } }];

            Appointment.findAll.mockResolvedValueOnce(mockAppointments).mockResolvedValueOnce(mockAdvisors);

            const res = await request(app)
                .get('/dashboard/user')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(200);
            expect(res.body.upcomingAppointments).toEqual(mockAppointments);
            expect(res.body.bookedAdvisors).toEqual(mockAdvisors);
        });


    });

    describe('GET /dashboard/advisor', () => {
        it('should return the advisor dashboard data', async () => {
            let created_at1 = new Date();
            created_at1 = created_at1.toString();
            const mockAdvisor = { advisor_id: 1 };
            const mockAppointments = [{ id: 1, start_time: created_at1, User: { email: 'user@example.com' } }];
            const mockInteractions = [{ id: 1, start_time: created_at1, User: { email: 'user@example.com' } }];

            Advisor.findOne.mockResolvedValue(mockAdvisor);
            Appointment.findAll.mockResolvedValueOnce(mockAppointments).mockResolvedValueOnce(mockInteractions);

            const res = await request(app)
                .get('/dashboard/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(200);
            expect(res.body.upcomingAppointments).toEqual(mockAppointments);
            expect(res.body.clientInteractions).toEqual(mockInteractions);
        });

        it('should return 404 if advisor profile is not found', async () => {
            Advisor.findOne.mockResolvedValue(null);

            const res = await request(app)
                .get('/dashboard/advisor')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Advisor profile not found');
        });

    });
});
