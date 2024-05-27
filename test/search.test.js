const request = require('supertest');
const { Advisor, Profile, Review } = require('../models/models');
const app = require('../app'); 


describe('Search Routes', () => {
    beforeEach(() => {
        jest.spyOn(Advisor, 'findAll').mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('GET /search/advisors', () => {
        it('should return a list of advisors based on search filters', async () => {
            const mockAdvisors = [
                {
                    id: 1,
                    location: 'New York',
                    expertise: 'Retirement Planning',
                    services_offered: 'Investment Advice',
                    Profile: { user_id: 1 },
                    Reviews: [{ rating: 5 }]
                }
            ];

            Advisor.findAll.mockResolvedValue(mockAdvisors);

            const res = await request(app)
                .get('/search/advisors')
                .query({
                    location: 'New York',
                    expertise: 'Retirement Planning',
                    services: 'Investment Advice',
                    rating_min: 4,
                    rating_max: 5
                });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockAdvisors);
        });


    });
});
