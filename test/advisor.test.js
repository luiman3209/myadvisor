const request = require('supertest');
const { Advisor, Review, Profile, User } = require('../models/models');
const app = require('../app'); // Ensure this points to where your Express app is exported



describe('Advisor Routes', () => {
    // Stubs for passport authentication and database models
    beforeEach(() => {

        jest.spyOn(Advisor, 'findOne').mockResolvedValue();
        jest.spyOn(Advisor, 'findByPk').mockResolvedValue();
        jest.spyOn(Review, 'findAll').mockResolvedValue();
        jest.spyOn(Review, 'create').mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('GET /advisor', () => {
        it('should return the detailed advisor profile for the authenticated user', async () => {
            const mockAdvisor = {
                id: 1,
                user_id: 1,
                Profile: { User: { email: 'test@example.com', created_at: new Date() } },
                Reviews: [{ User: { email: 'reviewer@example.com' } }],
            };
            Advisor.findOne.mockResolvedValue(mockAdvisor);
            Review.findAll.mockResolvedValue([]);

            const res = await request(app).get('/advisor');

            expect(res.status).toBe(200);
            expect(res.body.advisor).toEqual(mockAdvisor);
        });

        it('should return 404 if advisor not found', async () => {
            Advisor.findOne.mockResolvedValue(null);

            const res = await request(app).get('/advisor');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Advisor not found');
        });

        it('should return 500 if there is a server error', async () => {
            Advisor.findOne.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/advisor');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
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
            Advisor.findByPk.mockResolvedValue(mockAdvisor);
            Review.findAll.mockResolvedValue([]);

            const res = await request(app).get('/advisor/1');
            console.log('>>>>>>>>>>>' + res);
            expect(res.status).toBe(200);
            expect(res.body.advisor).toEqual(mockAdvisor);
        });

        it('should return 404 if advisor not found', async () => {
            Advisor.findByPk.mockResolvedValue(null);

            const res = await request(app).get('/advisor/1');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Advisor not found');
        });

        it('should return 500 if there is a server error', async () => {
            Advisor.findByPk.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/advisor/1');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });

    describe('POST /advisor/:advisorId/review', () => {
        it('should add a review for the advisor', async () => {
            const mockReview = { id: 1, user_id: 1, advisor_id: 1, rating: 5, review: 'Great advice!' };
            Review.create.mockResolvedValue(mockReview);

            const res = await request(app)
                .post('/advisor/1/review')
                .set('Authorization', 'Bearer mockToken')
                .send({ rating: 5, review: 'Great advice!' });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Review added successfully');
            expect(res.body.review).toEqual(mockReview);
        });

        it('should return 500 if there is a server error', async () => {
            Review.create.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .post('/advisor/1/review')
                .set('Authorization', 'Bearer mockToken')
                .send({ rating: 5, review: 'Great advice!' });

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });

    describe('GET /advisor/:advisorId/contact', () => {
        it('should return the contact information for the given advisor ID', async () => {
            const mockAdvisor = { id: 1, User: { email: 'advisor@example.com' }, contact_information: 'Contact Info' };
            Advisor.findByPk.mockResolvedValue(mockAdvisor);

            const res = await request(app).get('/advisor/1/contact');

            expect(res.status).toBe(200);
            expect(res.body.email).toBe('advisor@example.com');
            expect(res.body.contactInformation).toBe('Contact Info');
        });

        it('should return 404 if advisor not found', async () => {
            Advisor.findByPk.mockResolvedValue(null);

            const res = await request(app).get('/advisor/1/contact');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Advisor not found');
        });

        it('should return 500 if there is a server error', async () => {
            Advisor.findByPk.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/advisor/1/contact');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });
});
