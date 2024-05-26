const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { Advisor, Profile, Review } = require('../models/models');
const app = require('../app'); // Ensure this points to where your Express app is exported
const { Op } = require('sequelize');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Search Routes', () => {
    beforeEach(() => {
        sinon.stub(Advisor, 'findAll');
    });

    afterEach(() => {
        Advisor.findAll.restore();
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

            Advisor.findAll.resolves(mockAdvisors);

            const res = await chai.request(app)
                .get('/search/advisors')
                .query({
                    location: 'New York',
                    expertise: 'Retirement Planning',
                    services: 'Investment Advice',
                    rating_min: 4,
                    rating_max: 5
                });

            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal(mockAdvisors);
        });

        it('should return 500 if there is a server error', async () => {
            Advisor.findAll.rejects(new Error('Database error'));

            const res = await chai.request(app)
                .get('/search/advisors')
                .query({
                    location: 'New York',
                    expertise: 'Retirement Planning',
                    services: 'Investment Advice',
                    rating_min: 4,
                    rating_max: 5
                });

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });
});
