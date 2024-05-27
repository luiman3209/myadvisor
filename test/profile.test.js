const request = require('supertest');
const { Profile } = require('../models/models');
const app = require('../app'); // Ensure this points to where your Express app is exported
const passport = require('passport');

jest.mock('passport', () => ({
    authenticate: jest.fn(),
}));

describe('Profile Routes', () => {
    beforeEach(() => {
        passport.authenticate.mockImplementation((strategy, options, callback) => {
            return (req, res, next) => {
                req.user = { id: 1 }; // Mock user
                next();
            };
        });

        jest.spyOn(Profile, 'findOne').mockResolvedValue();
        jest.spyOn(Profile, 'create').mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('GET /profile', () => {
        it('should return the user profile', async () => {
            const mockProfile = { id: 1, user_id: 1, first_name: 'John', last_name: 'Doe' };

            Profile.findOne.mockResolvedValue(mockProfile);

            const res = await request(app)
                .get('/profile')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockProfile);
        });

        it('should return 404 if profile not found', async () => {
            Profile.findOne.mockResolvedValue(null);

            const res = await request(app)
                .get('/profile')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Profile not found');
        });

        it('should return 500 if there is a server error', async () => {
            Profile.findOne.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .get('/profile')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });

    describe('PUT /profile', () => {
        it('should update the user profile', async () => {
            const mockProfile = { id: 1, user_id: 1, first_name: 'John', last_name: 'Doe', update: jest.fn().mockResolvedValue() };
            const profileData = {
                first_name: 'John',
                last_name: 'Doe',
                phone_number: '1234567890',
                address: '123 Main St',
                preferences: 'Sample preferences',
                financial_goals: 'Sample goals',
                visibility: true
            };

            Profile.findOne.mockResolvedValue(mockProfile);

            const res = await request(app)
                .put('/profile')
                .set('Authorization', 'Bearer mockToken')
                .send(profileData);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Profile updated successfully');
        });

        it('should create a new profile if not found', async () => {
            const mockProfile = { id: 1, user_id: 1, first_name: 'John', last_name: 'Doe' };
            const profileData = {
                first_name: 'John',
                last_name: 'Doe',
                phone_number: '1234567890',
                address: '123 Main St',
                preferences: 'Sample preferences',
                financial_goals: 'Sample goals',
                visibility: true
            };

            Profile.findOne.mockResolvedValue(null);
            Profile.create.mockResolvedValue(mockProfile);

            const res = await request(app)
                .put('/profile')
                .set('Authorization', 'Bearer mockToken')
                .send(profileData);

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Profile created successfully');
            expect(res.body.profile).toEqual(mockProfile);
        });

        it('should return 500 if there is a server error', async () => {
            Profile.findOne.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .put('/profile')
                .set('Authorization', 'Bearer mockToken')
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    phone_number: '1234567890',
                    address: '123 Main St',
                    preferences: 'Sample preferences',
                    financial_goals: 'Sample goals',
                    visibility: true
                });

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database error');
        });
    });
});
