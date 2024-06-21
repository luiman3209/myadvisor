const { Op } = require('sequelize');

const { User, Profile, Advisor, Review, Appointment } = require('../models/models');

const cleanUserData = async () => {
    const now = new Date();
    try {

        // find user with creation date older than 21 june 2024
        const users = await User.findAll({
            where: {
                created_at: {
                    [Op.lt]: new Date('2024-06-21'),
                },
            },
        });

        const user_ids = users.map(user => user.user_id);

        await Profile.destroy({
            where: {
                user_id: {
                    [Op.in]: user_ids
                },

            },
        });

        await Advisor.destroy({
            where: {
                user_id: {
                    [Op.in]: user_ids
                },

            },
        });

        await Review.destroy({
            where: {
                user_id: {
                    [Op.in]: user_ids
                },

            },
        });

        await Appointment.destroy({
            where: {
                user_id: {
                    [Op.in]: user_ids
                },

            },
        });

        await Appointment.destroy({
            where: {
                created_at: {
                    [Op.lt]: new Date('2024-06-21'),
                },

            },
        });

        await User.destroy({
            where: {
                user_id: {
                    [Op.in]: user_ids
                },

            },
        });

        console.log('Deleted demo users:', user_ids);

    } catch (error) {
        console.error('Error deleting demo users:', error);
    }
};

module.exports = updateCompletedAppointments;
