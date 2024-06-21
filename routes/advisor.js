const express = require('express');
const passport = require('passport');
const { Advisor, Review, Profile, User, Appointment } = require('../models/models');
const { Qualification, ServiceType, AdvisorQualification, AdvisorService } = require('../models/models');
const router = express.Router();


router.put('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const {
        qualifications, // array of qualification IDs
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

    if (!user_id || !qualifications || !contact_information || !start_shift_1 || !end_shift_1 || !operating_country_code || !office_address || !operating_city_code || !display_name) {
        return res.status(400).json({
            message: 'Missing required fields',
            providedFields: {
                user_id,
                qualifications,
                contact_information,
                start_shift_1,
                end_shift_1,
                operating_country_code,
                office_address,
                operating_city_code,
                display_name,
            }
        });
    }

    try {
        let advisor = await Advisor.findOne({ where: { user_id } });

        if (advisor) {
            // Update existing advisor
            advisor.contact_information = contact_information;
            advisor.start_shift_1 = start_shift_1;
            advisor.end_shift_1 = end_shift_1;
            advisor.start_shift_2 = start_shift_2;
            advisor.end_shift_2 = end_shift_2;
            advisor.operating_country_code = operating_country_code;
            advisor.office_address = office_address;
            advisor.operating_city_code = operating_city_code;
            advisor.display_name = display_name;
            advisor.updated_at = new Date();
        } else {
            // Create new advisor
            advisor = await Advisor.create({
                user_id,
                contact_information,
                start_shift_1,
                end_shift_1,
                start_shift_2,
                end_shift_2,
                operating_country_code,
                office_address,
                operating_city_code,
                display_name,
            });
        }

        await advisor.save();

        // Update advisor qualifications
        if (Array.isArray(qualifications)) {
            await AdvisorQualification.destroy({ where: { advisor_id: advisor.advisor_id } });
            const advisorQualifications = qualifications.map(qualificationId => ({
                advisor_id: advisor.advisor_id,
                qualification_id: qualificationId
            }));
            await AdvisorQualification.bulkCreate(advisorQualifications);
        }

        // Update advisor service types
        if (selected_service_ids && Array.isArray(selected_service_ids)) {
            await AdvisorService.destroy({ where: { advisor_id: advisor.advisor_id } });
            const advisorServices = selected_service_ids.map(service_id => ({
                advisor_id: advisor.advisor_id,
                service_id
            }));
            await AdvisorService.bulkCreate(advisorServices);
        }

        res.json({ message: 'Advisor profile created or updated successfully', advisor });

    } catch (error) {

        res.status(500).json({ error: error.message });
    }
});


router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Find the advisor using the user_id
        const advisor = await Advisor.findOne({ where: { user_id: req.user.id }, include: [{ model: User, attributes: ['email', 'created_at'] }] });

        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }

        // Fetch reviews for the advisor
        const profileReviews = await Review.findAll({
            where: { advisor_id: advisor.advisor_id }, // Assuming the Review model has advisor_id that refers to Advisor model
            include: [{ model: User, attributes: ['email'] }],
        });

        const userProfile = await Profile.findOne({ where: { user_id: req.user.id } });


        // Fetch service types for the advisor
        const advisorServices = await AdvisorService.findAll({ where: { advisor_id: advisor.advisor_id } });

        // Fetch qualifications for the advisor
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
});



router.get('/:advisor_id', async (req, res) => {
    try {
        const { advisor_id } = req.params;

        // Find the advisor by ID, including the Profile
        const advisor = await Advisor.findByPk(advisor_id);

        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }

        // Update profile views
        advisor.profile_views += 1;
        await advisor.save();

        // Fetch reviews for the advisor
        const profileReviews = await Review.findAll({
            attributes: ['review', 'rating', 'created_at'],
            where: { advisor_id },
            include: [
                {
                    model: User, attributes: [],
                    include: [{ model: Profile, attributes: ['first_name'] }],
                    required: true
                },],
            order: [['rating', 'DESC'], ['created_at', 'DESC']],
            limit: parseInt(6),
        });

        let totalRating = 0;
        for (const review of profileReviews) {
            totalRating += review.rating;
        }

        const averageRating = profileReviews.length > 0 ? totalRating / profileReviews.length : 0;



        // Fetch service types for the advisor
        const advisorServices = await AdvisorService.findAll({ where: { advisor_id } });
        const serviceIds = advisorServices.map(as => as.service_id);
        const serviceTypes = await ServiceType.findAll({ where: { service_id: serviceIds } });

        // Fetch qualifications for the advisor
        const advisorQualifications = await AdvisorQualification.findAll({ where: { advisor_id: advisor_id } });
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
});

router.get('/book-info/:advisor_id', async (req, res) => {
    try {
        const { advisor_id } = req.params;

        // Find the advisor by ID, including the Profile
        const advisor = await Advisor.findByPk(advisor_id);

        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }

        // Update profile views
        advisor.profile_views += 1;
        await advisor.save();

        res.json(
            advisor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.post('/review', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { rating, review, appointmentId } = req.body;
        const userId = req.user.id;

        if (!appointmentId || !rating) {
            return res.status(400).json({ message: 'Rating is required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        if (review.length > 500) {
            return res.status(400).json({ message: 'Review must be 500 characters long max' });
        }

        // Check if the appointment exists and is not reviewed
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

        // Set appointment reviewed
        appointment.is_reviewed = true;
        await appointment.save();

        const newReview = await Review.create({
            user_id: userId,
            advisor_id: appointment.advisor_id,
            appointment_id: appointment.appointment_id,
            rating,
            review,
        });

        res.json(newReview);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;
