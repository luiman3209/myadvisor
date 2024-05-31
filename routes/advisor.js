const express = require('express');
const passport = require('passport');
const { Advisor, Review, Profile, User } = require('../models/models');
const { ServiceType, AdvisorService } = require('../models/models');
const router = express.Router();



/**
 * @swagger
 * /advisor:
 *   put:
 *     summary: Create or update an advisor profile
 *     tags:
 *       - Advisor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               qualifications:
 *                 type: string
 *                 example: "MBA, CFA"
 *               expertise:
 *                 type: string
 *                 example: "Investment Management"
 *               contact_information:
 *                 type: string
 *                 example: "contact@advisor.com"
 *               start_shift_1:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-05-01T09:00:00Z"
 *               end_shift_1:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-05-01T17:00:00Z"
 *               start_shift_2:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-05-01T18:00:00Z"
 *               end_shift_2:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-05-01T20:00:00Z"
 *               selected_service_types:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               operating_country_code:
 *                 type: string
 *                 example: "US"
 *               office_address:
 *                 type: string
 *                 example: "123 Main St, Suite 400"
 *               operating_city_code:
 *                 type: string
 *                 example: "NYC"
 *     responses:
 *       200:
 *         description: Advisor profile created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 advisor:
 *                   type: object
 *                   properties:
 *                     advisor_id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     qualifications:
 *                       type: string
 *                     expertise:
 *                       type: string
 *                     contact_information:
 *                       type: string
 *                     start_shift_1:
 *                       type: string
 *                       format: date-time
 *                     end_shift_1:
 *                       type: string
 *                       format: date-time
 *                     start_shift_2:
 *                       type: string
 *                       format: date-time
 *                     end_shift_2:
 *                       type: string
 *                       format: date-time
 *                     profile_views:
 *                       type: integer
 *                     operating_country_code:
 *                       type: string
 *                     office_address:
 *                       type: string
 *                     operating_city_code:
 *                       type: string
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */

router.put('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const {
        qualifications,
        expertise,
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
    if (!user_id || !qualifications || !expertise || !contact_information || !start_shift_1 || !end_shift_1 || !operating_country_code || !office_address || !operating_city_code) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        let advisor = await Advisor.findOne({ where: { user_id } });

        if (advisor) {
            // Update existing advisor
            advisor.qualifications = qualifications;
            advisor.expertise = expertise;
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
                qualifications,
                expertise,
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

        // Update advisor service types
        if (selected_service_types && Array.isArray(selected_service_types)) {
            await AdvisorService.destroy({ where: { advisor_id: advisor.advisor_id } });
            const advisorServices = selected_service_types.map(service_id => ({
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     specialty:
 *                       type: string
 *                       example: Financial Advisor
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
 *                         type: string
 *                         example: "Y"
 */
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        console.log('Advisor detail requested');
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

        res.json({
            advisor,
            profileReviews,
            serviceTypes,
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
 *                       type: string
 *                       example: "MBA, CFA"
 *                     expertise:
 *                       type: string
 *                       example: "Investment Management"
 *                     contact_information:
 *                       type: string
 *                       example: "contact@advisor.com"
 *                     start_shift_1:
 *                       type: string
 *                       format: date-time
 *                     end_shift_1:
 *                       type: string
 *                       format: date-time
 *                     start_shift_2:
 *                       type: string
 *                       format: date-time
 *                     end_shift_2:
 *                       type: string
 *                       format: date-time
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
 *                         type: string
 *                         example: "Y"
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

        // Fetch reviews for the advisor
        const profileReviews = await Review.findAll({
            where: { advisor_id },
            include: [{ model: User, attributes: ['email'] }],
        });

        // Fetch service types for the advisor
        const advisorServices = await AdvisorService.findAll({ where: { advisor_id } });
        const serviceIds = advisorServices.map(as => as.service_id);
        const serviceTypes = await ServiceType.findAll({ where: { service_id: serviceIds } });

        res.json({
            advisor: {
                ...advisor.get(),
                first_name: advisor.Profile.first_name,
                last_name: advisor.Profile.last_name,
            },
            profileReviews,
            serviceTypes,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /advisor/{advisorId}/review:
 *   post:
 *     summary: Leave a review for an advisor
 *     tags:
 *       - Advisor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: advisorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The advisor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
router.post('/:advisorId/review', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { rating, review } = req.body;
        const { advisorId } = req.params;
        const userId = req.user.id;

        const newReview = await Review.create({
            user_id: userId,
            advisor_id: advisorId,
            rating,
            review,
        });

        res.json({ message: 'Review added successfully', review: newReview });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /advisor/{advisorId}/contact:
 *   get:
 *     summary: Get advisor contact information
 *     tags:
 *       - Advisor
 *     parameters:
 *       - in: path
 *         name: advisorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The advisor ID
 *     responses:
 *       200:
 *         description: Advisor contact information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: "advisor@example.com"
 *                 contactInformation:
 *                   type: string
 *                   example: "Contact details here"
 *       404:
 *         description: Advisor not found
 */

router.get('/:advisorId/contact', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const advisor = await Advisor.findByPk(req.params.advisorId, {
            include: [{ model: User, attributes: ['email'] }],
        });

        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }

        res.json({
            email: advisor.User.email,
            contactInformation: advisor.contact_information,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
