const request = require('supertest');
const { Profile } = require('../models/models');
const app = require('../app'); // Adjust the path to your Express app

describe('Profile Routes', () => {
    describe('GET /profile', () => {
        it('should return the user profile', async () => {
            const mockProfile = { id: 1, user_id: 1, first_name: 'John', last_name: 'Doe' };

            jest.spyOn(Profile, 'findOne').mockResolvedValue(mockProfile);

            const res = await request(app)
                .get('/profile')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockProfile);
        });

        it('should return 404 if profile not found', async () => {
            jest.spyOn(Profile, 'findOne').mockResolvedValue(null);

            const res = await request(app)
                .get('/profile')
                .set('Authorization', 'Bearer mockToken');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Profile not found');
        });

        //it('should return 500 if there is a server error', async () => {
        //    jest.spyOn(Profile, 'findOne').mockRejectedValue(new Error('Database error'));
//
        //    const res = await request(app)
        //        .get('/profile')
        //        .set('Authorization', 'Bearer mockToken');
//
        //    expect(res.status).toBe(500);
        //    expect(res.body.error).toBe('Database error');
        //});
    });

    // Add other tests as needed
});
