const express = require('express');
const passport = require('passport');
const { Advisor, Review, Profile, User, Appointment } = require('../models/models');
const { Qualification, ServiceType, AdvisorQualification, AdvisorService } = require('../models/models');
const { body, param, validationResult } = require('express-validator');
const xss = require('xss');
const router = express.Router();

// Middleware to check validation results and handle errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.put('/',
    passport.authenticate('jwt', { session: false }),
    [
        body('qualifications').isArray(),
        body('contact_information').trim().escape(),
        body('start_shift_1').trim().escape(),
        body('end_shift_1').trim().escape(),
        body('start_shift_2').trim().escape().optional({ checkFalsy: true }),
        body('end_shift_2').trim().escape().optional({ checkFalsy: true }),
        body('selected_service_ids').isArray(),
        body('operating_country_code').trim().escape(),
        body('office_address').trim(),
        body('operating_city_code').trim().escape(),
        body('display_name').trim().escape()
    ],
    handleValidationErrors,
    async (req, res) => {

        const {
            qualifications,
            contact_information,
            start_shift_1,
            end_shift_1,
            start_shift_2,
            end_shift_2,
            selected_service_ids,
            operating_country_code,
            office_address,
            operating_city_code,
            display_name,
        } = req.body;
        const user_id = req.user.id;

        try {
            let advisor = await Advisor.findOne({ where: { user_id } });

            if (advisor) {
                // Update existing advisor
                advisor.contact_information = xss(contact_information);
                advisor.start_shift_1 = xss(start_shift_1);
                advisor.end_shift_1 = xss(end_shift_1);
                advisor.start_shift_2 = start_shift_2 ? xss(start_shift_2) : null;
                advisor.end_shift_2 = end_shift_2 ? xss(end_shift_2) : null;
                advisor.operating_country_code = xss(operating_country_code);
                advisor.office_address = xss(office_address);
                advisor.operating_city_code = xss(operating_city_code);
                advisor.display_name = xss(display_name);
                advisor.updated_at = new Date();

                await advisor.save();
            } else {
                // Create new advisor
                advisor = await Advisor.create({
                    user_id,
                    contact_information: xss(contact_information),
                    start_shift_1: xss(start_shift_1),
                    end_shift_1: xss(end_shift_1),
                    start_shift_2: start_shift_2 ? xss(start_shift_2) : null,
                    end_shift_2: end_shift_2 ? xss(end_shift_2) : null,
                    operating_country_code: xss(operating_country_code),
                    office_address: xss(office_address),
                    operating_city_code: xss(operating_city_code),
                    display_name: xss(display_name),
                });
            }



            // Update advisor qualifications
            if (Array.isArray(qualifications)) {
                await AdvisorQualification.destroy({ where: { advisor_id: advisor.advisor_id } });
                const advisorQualifications = qualifications.map(qualificationId => ({
                    advisor_id: advisor.advisor_id,
                    qualification_id: xss(qualificationId.toString())
                }));
                await AdvisorQualification.bulkCreate(advisorQualifications);
            }

            // Update advisor service types
            if (selected_service_ids && Array.isArray(selected_service_ids)) {
                await AdvisorService.destroy({ where: { advisor_id: advisor.advisor_id } });
                const advisorServices = selected_service_ids.map(service_id => ({
                    advisor_id: advisor.advisor_id,
                    service_id: xss(service_id.toString())
                }));
                await AdvisorService.bulkCreate(advisorServices);
            }

            res.json({ message: 'Advisor profile created or updated successfully', advisor });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const advisor = await Advisor.findOne({ where: { user_id: req.user.id }, include: [{ model: User, attributes: ['email', 'created_at'] }] });

            if (!advisor) {
                return res.status(404).json({ message: 'Advisor not found' });
            }

            const profileReviews = await Review.findAll({
                where: { advisor_id: advisor.advisor_id },
                include: [{ model: User, attributes: ['email'] }],
            });

            const userProfile = await Profile.findOne({ where: { user_id: req.user.id } });

            const advisorServices = await AdvisorService.findAll({ where: { advisor_id: advisor.advisor_id } });

            const advisorQualifications = await AdvisorQualification.findAll({ where: { advisor_id: advisor.advisor_id } });

            res.json({
                advisor,
                profileReviews,
                serviceTypes: advisorServices.map(st => st.service_id),
                qualifications: advisorQualifications.map(aq => aq.qualification_id),
                userProfile,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/:advisor_id',
    [
        param('advisor_id').trim().escape()
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { advisor_id } = req.params;

            const advisor = await Advisor.findByPk(advisor_id);

            if (!advisor) {
                return res.status(404).json({ message: 'Advisor not found' });
            }

            advisor.profile_views += 1;
            await advisor.save();

            const profileReviews = await Review.findAll({
                attributes: ['review', 'rating', 'created_at'],
                where: { advisor_id },
                include: [
                    {
                        model: User, attributes: [],
                        include: [{ model: Profile, attributes: ['first_name'] }],
                        required: true
                    },
                ],
                order: [['rating', 'DESC'], ['created_at', 'DESC']],
                limit: parseInt(6, 10),
            });

            let totalRating = 0;
            for (const review of profileReviews) {
                totalRating += review.rating;
            }

            const averageRating = profileReviews.length > 0 ? totalRating / profileReviews.length : 0;

            const advisorServices = await AdvisorService.findAll({ where: { advisor_id } });
            const serviceIds = advisorServices.map(as => as.service_id);
            const serviceTypes = await ServiceType.findAll({ where: { service_id: serviceIds } });

            const advisorQualifications = await AdvisorQualification.findAll({ where: { advisor_id } });
            const qualificationIds = advisorQualifications.map(aq => aq.qualification_id);
            const qualifications = await Qualification.findAll({ where: { qualification_id: qualificationIds } });

            res.json({
                advisor: advisor,
                profileReviews,
                serviceTypes,
                qualifications,
                average_rating: averageRating,
                review_count: profileReviews.length,
                offices: [advisor.office_address],
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/book-info/:advisor_id',
    [
        param('advisor_id').trim().escape()
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { advisor_id } = req.params;

            const advisor = await Advisor.findByPk(advisor_id);

            if (!advisor) {
                return res.status(404).json({ message: 'Advisor not found' });
            }

            advisor.profile_views += 1;
            await advisor.save();

            res.json(advisor);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/review',
    passport.authenticate('jwt', { session: false }),
    [
        body('rating').isInt({ min: 1, max: 5 }),
        body('review').trim().escape().isLength({ max: 500 }),
        body('appointmentId').isInt()
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { rating, review, appointmentId } = req.body;
            const userId = req.user.id;

            const appointment = await Appointment.findByPk(appointmentId);

            if (!appointment) {
                return res.status(400).json({ message: 'Invalid appointment ID' });
            }

            if (appointment.is_reviewed) {
                return res.status(400).json({ message: 'Appointment already reviewed' });
            }

            if (appointment.user_id !== userId) {
                return res.status(400).json({ message: 'You are not authorized to review this appointment' });
            }

            appointment.is_reviewed = true;
            await appointment.save();

            const newReview = await Review.create({
                user_id: userId,
                advisor_id: appointment.advisor_id,
                appointment_id: appointment.appointment_id,
                rating: xss(rating.toString()),
                review: xss(review),
            });

            res.json(newReview);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router;
