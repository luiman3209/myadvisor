const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');

const { Review, Advisor, User, Profile } = require('../models/models');
const router = express.Router();


router.get('/latest-reviews', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        if (limit > 100) return res.status(400).json({ error: 'Limit must be less than 100' });

        const reviews = await Review.findAll({
            include: [
                { model: Advisor, attributes: ['advisor_id', 'display_name', 'img_url'], required: true },
                {
                    model: User, attributes: ['user_id'],
                    include: [{ model: Profile, attributes: ['first_name'], required: true }],
                    required: true
                },],
            order: [['rating', 'DESC'], ['created_at', 'DESC']],
            limit: parseInt(limit),
        });

        res.json(reviews);
    } catch (error) {

        res.status(500).json({ error: error.message });
    }
});


router.post('/filter', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { sort_by, sort_type, min_date, min_rating, max_rating, max_date, has_text, page, limit } = req.body;


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


        if (!page || page < 1) page = 1;
        if (!limit || limit < 1 || limit > 50) limit = 10;

        const offset = (page - 1) * limit;


        if (min_date) whereClause.created_at = { [Op.gte]: min_date };
        if (max_date) whereClause.created_at = { [Op.lte]: max_date };

        if (min_rating) whereClause.rating = { [Op.gte]: min_rating };
        if (max_rating) whereClause.rating = { [Op.lte]: max_rating };

        if (has_text && has_text === true) whereClause.review = { [Op.not]: '' };
        if (has_text && has_text === false) whereClause.review = '';

        let orderClause = [];
        if (sort_by && sort_by !== 'rating' && sort_by !== 'created_at') {
            return res.status(400).json({ message: 'Invalid sort_by parameter' });
        }


        if (sort_type && sort_type !== 'asc' && sort_type !== 'desc') {
            return res.status(400).json({ message: 'Invalid sort_type parameter' });
        }


        let sortClause = [];
        if (sort_by) { sortClause.push(sort_by) } else { sortClause.push('created_at'); }
        if (sort_type) { sortClause.push(sort_type) } else { sortClause.push('DESC'); }

        orderClause.push(sortClause);

        const { count, rows } = await Review.findAndCountAll({
            where: whereClause,
            order: orderClause,
            attributes: ['review_id', 'user_id', 'advisor_id', 'appointment_id', 'rating', 'review', 'created_at'],
            include: {
                model: User, attributes: ['user_id',], include: {
                    model: Profile, attributes: ['first_name'],
                    required: true
                }
            },
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            totalItems: count,
            totalPages: totalPages,
            currentPage: page,
            reviews: rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
