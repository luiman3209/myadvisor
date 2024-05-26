const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { Profile } = require('../models/models');
const app = require('../app'); // Ensure this points to where your Express app is exported
const passport = require('passport');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Profile Routes', () => {
    beforeEach(() => {
        sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
            return (req, res, next) => {
                req.user = { id: 1 }; // Mock user
                next();
            };
        });

        sinon.stub(Profile, 'findOne');
        sinon.stub(Profile, 'create');
    });

    afterEach(() => {
        passport.authenticate.restore();
        Profile.findOne.restore();
        Profile.create.restore();
    });

    describe('GET /profile', () => {
        it('should return the user profile', async () => {
            const mockProfile = { id: 1, user_id: 1, first_name: 'John', last_name: 'Doe' };

            Profile.findOne.resolves(mockProfile);

            const res = await chai.request(app)
                .get('/profile')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal(mockProfile);
        });

        it('should return 404 if profile not found', async () => {
            Profile.findOne.resolves(null);

            const res = await chai.request(app)
                .get('/profile')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(404);
            expect(res.body.message).to.equal('Profile not found');
        });

        it('should return 500 if there is a server error', async () => {
            Profile.findOne.rejects(new Error('Database error'));

            const res = await chai.request(app)
                .get('/profile')
                .set('Authorization', 'Bearer mockToken');

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });

    describe('PUT /profile', () => {
        it('should update the user profile', async () => {
            const mockProfile = { id: 1, user_id: 1, first_name: 'John', last_name: 'Doe', update: sinon.stub().resolves() };
            const profileData = {
                first_name: 'John',
                last_name: 'Doe',
                phone_number: '1234567890',
                address: '123 Main St',
                preferences: 'Sample preferences',
                financial_goals: 'Sample goals',
                visibility: true
            };

            Profile.findOne.resolves(mockProfile);

            const res = await chai.request(app)
                .put('/profile')
                .set('Authorization', 'Bearer mockToken')
                .send(profileData);

            expect(res).to.have.status(200);
            expect(res.body.message).to.equal('Profile updated successfully');
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

            Profile.findOne.resolves(null);
            Profile.create.resolves(mockProfile);

            const res = await chai.request(app)
                .put('/profile')
                .set('Authorization', 'Bearer mockToken')
                .send(profileData);

            expect(res).to.have.status(201);
            expect(res.body.message).to.equal('Profile created successfully');
            expect(res.body.profile).to.deep.equal(mockProfile);
        });

        it('should return 500 if there is a server error', async () => {
            Profile.findOne.rejects(new Error('Database error'));

            const res = await chai.request(app)
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

            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Database error');
        });
    });
});
