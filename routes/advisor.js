const express = require('express');
const passport = require('passport');
const { Advisor, Review, Profile, User } = require('../models/models');
const { Qualification, AdvisorQualification, AdvisorService } = require('../models/models');
const router = express.Router();


router.put('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const {
        qualifications, // array of qualification IDs
        contact_information,
        start_shift_1,
        end_shift_1,
        start_shift_2,
        end_shift_2,
        selected_service_types,
        operating_country_code,
        office_address,
        operating_city_code
    } = req.body;
    const user_id = req.user.id;

    if (!user_id || !qualifications || !contact_information || !start_shift_1 || !end_shift_1 || !operating_country_code || !office_address || !operating_city_code) {
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
                operating_city_code
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
                operating_city_code
            });
        }

        await advisor.save();

        // Update advisor qualifications
        if (Array.isArray(qualifications)) {
            await AdvisorQualification.destroy({ where: { advisorId: advisor.advisor_id } });
            const advisorQualifications = qualifications.map(qualificationId => ({
                advisor_id: advisor.advisor_id,
                qualification_id: qualificationId
            }));
            await AdvisorQualification.bulkCreate(advisorQualifications);
        }

        // Update advisor service types
        if (selected_service_types && Array.isArray(selected_service_types)) {
            await AdvisorService.destroy({ where: { advisor_id: advisor.advisor_id } });
            const advisorServices = selected_service_types.map(service_id => ({
                advisor_id: advisor.advisor_id,
                service_id
            }));
            await AdvisorService.bulkCreate(advisorServices);
        }
        console.log('advisor registered');
        res.json({ message: 'Advisor profile created or updated successfully', advisor });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /advisor:
 *   get:
 *     summary: Get detailed advisor profile
 *     tags:
 *       - Advisor
 *     responses:
 *       200:
 *         description: Detailed advisor profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 advisor:
 *                   type: object
 *                   properties:
 *                     advisor_id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     contact_information:
 *                       type: string
 *                       example: contact@advisor.com
 *                     start_shift_1:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T09:00:00Z"
 *                     end_shift_1:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T17:00:00Z"
 *                     start_shift_2:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T18:00:00Z"
 *                     end_shift_2:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T20:00:00Z"
 *                     profile_views:
 *                       type: integer
 *                       example: 100
 *                     operating_country_code:
 *                       type: string
 *                       example: "US"
 *                     office_address:
 *                       type: string
 *                       example: "123 Main St, Suite 400"
 *                     operating_city_code:
 *                       type: string
 *                       example: "NYC"
 *                 profileReviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       advisor_id:
 *                         type: integer
 *                         example: 1
 *                       review:
 *                         type: string
 *                         example: "Great advice!"
 *                       rating:
 *                         type: integer
 *                         example: 5
 *                 serviceTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       service_id:
 *                         type: integer
 *                         example: 1
 *                       service_type_name:
 *                         type: string
 *                         example: "Financial Planning"
 *                       service_type_code:
 *                         type: string
 *                         example: "FP"
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *                 qualifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Certified Financial Planner"
 *                       abbreviation:
 *                         type: string
 *                         example: "CFP"
 *       404:
 *         description: Advisor not found
 *       500:
 *         description: Server error
 */
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Find the advisor using the user_id
        const advisor = await Advisor.findOne({ where: { user_id: req.user.id } });

        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }

        // Fetch reviews for the advisor
        const profileReviews = await Review.findAll({
            where: { advisor_id: advisor.advisor_id }, // Assuming the Review model has advisor_id that refers to Advisor model
            include: [{ model: User, attributes: ['email'] }],
        });

        // Fetch service types for the advisor
        const advisorServices = await AdvisorService.findAll({ where: { advisor_id: advisor.advisor_id } });
        const serviceIds = advisorServices.map(as => as.service_id);
        const serviceTypes = await ServiceType.findAll({ where: { service_id: serviceIds } });

        // Fetch qualifications for the advisor
        const advisorQualifications = await AdvisorQualification.findAll({ where: { advisorId: advisor.advisor_id } });
        const qualificationIds = advisorQualifications.map(aq => aq.qualificationId);
        const qualifications = await Qualification.findAll({ where: { id: qualificationIds } });

        res.json({
            advisor,
            profileReviews,
            serviceTypes,
            qualifications,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



/**
 * @swagger
 * /{advisor_id}:
 *   get:
 *     summary: Get detailed advisor profile by ID
 *     tags:
 *       - Advisor
 *     parameters:
 *       - in: path
 *         name: advisor_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The advisor ID
 *     responses:
 *       200:
 *         description: Detailed advisor profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 advisor:
 *                   type: object
 *                   properties:
 *                     advisor_id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     operating_country_code:
 *                       type: string
 *                       example: "US"
 *                     qualifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Certified Financial Planner"
 *                           abbreviation:
 *                             type: string
 *                             example: "CFP"
 *                     contact_information:
 *                       type: string
 *                       example: "contact@advisor.com"
 *                     start_shift_1:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T09:00:00Z"
 *                     end_shift_1:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T17:00:00Z"
 *                     start_shift_2:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T18:00:00Z"
 *                     end_shift_2:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-01T20:00:00Z"
 *                     profile_views:
 *                       type: integer
 *                       example: 0
 *                     is_verified:
 *                       type: string
 *                       example: "N"
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                 profileReviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       advisor_id:
 *                         type: integer
 *                         example: 1
 *                       review:
 *                         type: string
 *                         example: "Great advice!"
 *                       rating:
 *                         type: integer
 *                         example: 5
 *                 serviceTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       service_id:
 *                         type: integer
 *                         example: 1
 *                       service_type_name:
 *                         type: string
 *                         example: "Financial Planning"
 *                       service_type_code:
 *                         type: string
 *                         example: "FP"
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *                 offices:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["123 Main St, Suite 400"]
 *       404:
 *         description: Advisor not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/:advisor_id', async (req, res) => {
    try {
        const { advisor_id } = req.params;

        // Find the advisor by ID, including the Profile
        const advisor = await Advisor.findByPk(advisor_id, {
            include: [
                {
                    model: Profile,
                    attributes: ['first_name', 'last_name'],
                },
            ],
        });

        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }

        // Update profile views
        advisor.profile_views += 1;
        await advisor.save();

        // Fetch reviews for the advisor
        const profileReviews = await Review.findAll({
            where: { advisor_id },
            include: [{ model: User, attributes: ['email'] }],
            order: [['created_at', 'DESC']],
            limit: 10,
        });

        // Fetch service types for the advisor
        const advisorServices = await AdvisorService.findAll({ where: { advisor_id } });
        const serviceIds = advisorServices.map(as => as.service_id);
        const serviceTypes = await ServiceType.findAll({ where: { service_id: serviceIds } });

        // Fetch qualifications for the advisor
        const advisorQualifications = await AdvisorQualification.findAll({ where: { advisorId: advisor_id } });
        const qualificationIds = advisorQualifications.map(aq => aq.qualification_id);
        const qualifications = await Qualification.findAll({ where: { qualification_id: qualificationIds } });

        res.json({
            advisor: {
                ...advisor.get(),
                first_name: advisor.profile.first_name,
                last_name: advisor.profile.last_name,
            },
            profileReviews,
            serviceTypes,
            qualifications,
            offices: [advisor.office_address],
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * @swagger
 * /advisor/review:
 *   post:
 *     summary: Leave a review for an advisor
 *     tags:
 *       - Advisor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId:
 *                  type: integer
 *                  example: 1
 *               rating:
 *                 type: integer
 *                 example: 5
 *               review:
 *                 type: string
 *                 example: "Great advice!"
 *     responses:
 *       200:
 *         description: Review added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review added successfully"
 *                 review:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     advisor_id:
 *                       type: integer
 *                       example: 1
 *                     rating:
 *                       type: integer
 *                       example: 5
 *                     review:
 *                       type: string
 *                       example: "Great advice!"
 */
router.post('/review', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { rating, review, appointmentId } = req.body;
        const userId = req.user.id;

        if (!appointmentId || !rating || !review) {
            return res.status(400).json({ message: 'Rating and review are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        if (review.length < 10 || review.length > 500) {
            return res.status(400).json({ message: 'Review must me between 10 and 500 characters long' });
        }

        // Check if the appointment exists and is not reviewed
        const appointment = await Appointment.findOne({ where: { appointment_id: appointmentId } });

        if (!appointment) {
            return res.status(400).json({ message: 'Invalid appointment ID' });
        }

        if (appointment.is_reviewed) {
            return res.status(400).json({ message: 'Appointment already reviewed' });
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

        res.json({ message: 'Review added successfully', review: newReview });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;
