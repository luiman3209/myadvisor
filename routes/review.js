const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');
const { Review, Advisor, User, Profile } = require('../models/models');
const { validationResult, body } = require('express-validator');

const router = express.Router();

// Validation middleware
const filterReviewsValidationRules = [
    body('sort_by').optional().isIn(['rating', 'created_at']).withMessage('Sort_by must be either "rating" or "created_at"'),
    body('sort_type').optional().isIn(['asc', 'desc']).withMessage('Sort_type must be either "asc" or "desc"'),
    body('min_date').optional({ nullable: true }).isISO8601().toDate().withMessage('Min_date must be a valid date in ISO format'),
    body('max_date').optional({ nullable: true }).isISO8601().toDate().withMessage('Max_date must be a valid date in ISO format'),
    body('min_rating').optional({ nullable: true }).isInt({ min: 1, max: 5 }).withMessage('Min_rating must be an integer between 1 and 5'),
    body('max_rating').optional({ nullable: true }).isInt({ min: 1, max: 5 }).withMessage('Max_rating must be an integer between 1 and 5'),
    body('has_text').optional({ nullable: true }).isBoolean().withMessage('Has_text must be a boolean value'),
    body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    body('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be an integer between 1 and 50'),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post('/filter', passport.authenticate('jwt', { session: false }), filterReviewsValidationRules, handleValidationErrors, async (req, res) => {
    try {
        const { sort_by, sort_type, min_date, min_rating, max_rating, max_date, has_text, page = 1, limit = 10 } = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let whereClause = {};

        if (user.role === 'advisor') {
            const advisor = await Advisor.findOne({ where: { user_id: req.user.id } });
            if (!advisor) {
                return res.status(404).json({ message: 'Advisor not found' });
            }
            whereClause.advisor_id = advisor.advisor_id;
        } else {
            whereClause.user_id = req.user.id;
        }

        if (min_date) whereClause.created_at = { [Op.gte]: min_date };
        if (max_date) whereClause.created_at = { ...whereClause.created_at, [Op.lte]: max_date };

        if (min_rating) whereClause.rating = { [Op.gte]: min_rating };
        if (max_rating) whereClause.rating = { ...whereClause.rating, [Op.lte]: max_rating };

        if (has_text !== undefined) {
            if (has_text) {
                whereClause.review = { [Op.not]: '' };
            } else {
                whereClause.review = '';
            }
        }

        let orderClause = [['created_at', 'DESC']];
        if (sort_by && sort_type) {
            orderClause = [[sort_by, sort_type]];
        }

        const { count, rows } = await Review.findAndCountAll({
            where: whereClause,
            order: orderClause,
            attributes: ['review_id', 'user_id', 'advisor_id', 'appointment_id', 'rating', 'review', 'created_at'],
            include: {
                model: User, attributes: ['user_id'], include: {
                    model: Profile, attributes: ['first_name'],
                    required: true
                }
            },
            limit,
            offset: (page - 1) * limit,
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            totalItems: count,
            totalPages: totalPages,
            currentPage: page,
            reviews: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
