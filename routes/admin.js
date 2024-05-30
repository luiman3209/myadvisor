const express = require('express');
const { User, Advisor, Review, Appointment } = require('../models/models');
const passport = require('passport');
const { ServiceType } = require('../models/models');

const router = express.Router();

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

// Endpoint to insert a new service type
router.post('/services/add', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { service_type_name, service_type_code, is_active } = req.body;
  
    if (!service_type_name || !service_type_code || !is_active) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const [serviceType, created] = await ServiceType.findOrCreate({
        where: { service_type_code },
        defaults: { service_type_name, is_active },
      });
  
      if (!created) {
        return res.status(409).json({ message: 'Service type already exists' });
      }
  
      res.status(201).json(serviceType);
    } catch (error) {
      console.error('Error inserting service type:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Retrieve a list of users
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: John Doe
 */
router.get('/users', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: john.doe@example.com
 *       404:
 *         description: User not found
 */
router.put('/users/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await user.update(req.body);
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /admin/advisors:
 *   get:
 *     summary: Retrieve a list of advisors
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of advisors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   userId:
 *                     type: integer
 *                     example: 1
 *                   specialty:
 *                     type: string
 *                     example: Financial Advisor
 */
router.get('/advisors', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const advisors = await Advisor.findAll({ include: User });
        res.json(advisors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /admin/advisors/{id}:
 *   put:
 *     summary: Update an advisor
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               specialty:
 *                 type: string
 *                 example: Financial Advisor
 *     responses:
 *       200:
 *         description: The updated advisor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 userId:
 *                   type: integer
 *                   example: 1
 *                 specialty:
 *                   type: string
 *                   example: Financial Advisor
 *       404:
 *         description: Advisor not found
 */
router.put('/advisors/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const advisor = await Advisor.findByPk(req.params.id);
        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }
        const updatedAdvisor = await advisor.update(req.body);
        res.json(updatedAdvisor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /admin/advisors/{id}:
 *   delete:
 *     summary: Delete an advisor
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The advisor ID
 *     responses:
 *       200:
 *         description: Advisor deleted successfully
 *       404:
 *         description: Advisor not found
 */
router.delete('/advisors/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const advisor = await Advisor.findByPk(req.params.id);
        if (!advisor) {
            return res.status(404).json({ message: 'Advisor not found' });
        }
        await advisor.destroy();
        res.json({ message: 'Advisor deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /admin/reviews:
 *   get:
 *     summary: Retrieve a list of reviews
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   userId:
 *                     type: integer
 *                     example: 1
 *                   advisorId:
 *                     type: integer
 *                     example: 1
 *                   reviewText:
 *                     type: string
 *                     example: "Great advice!"
 */
router.get('/reviews', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const reviews = await Review.findAll({ include: [User, Advisor] });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /admin/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 */
router.delete('/reviews/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        await review.destroy();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get analytics data
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userCount:
 *                   type: integer
 *                   example: 100
 *                 advisorCount:
 *                   type: integer
 *                   example: 20
 *                 appointmentCount:
 *                   type: integer
 *                   example: 150
 *                 recentActivities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       userId:
 *                         type: integer
 *                         example: 1
 *                       advisorId:
 *                         type: integer
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: '2023-01-01T00:00:00.000Z'
 */
router.get('/analytics', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const userCount = await User.count();
        const advisorCount = await Advisor.count();
        const appointmentCount = await Appointment.count();

        const recentActivities = await Appointment.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [User, Advisor],
        });

        res.json({
            userCount,
            advisorCount,
            appointmentCount,
            recentActivities,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
