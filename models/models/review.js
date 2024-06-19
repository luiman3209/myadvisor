const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('reviews', {
        review_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'user_configs',
                key: 'user_id',
            },
            onDelete: 'SET NULL',
        },
        advisor_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'advisors',
                key: 'advisor_id',
            },
            onDelete: 'CASCADE',
        },
        appointment_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'appointments',
                key: 'appointment_id',
            },
            onDelete: 'SET NULL',
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        review: DataTypes.TEXT,
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        timestamps: false,
    });
};
