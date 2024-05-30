const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('advisors', {
        advisor_id: {
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
            onDelete: 'CASCADE',
        },
        qualifications: DataTypes.TEXT,
        expertise: DataTypes.TEXT,
        contact_information: DataTypes.TEXT,
        start_shift_1: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_shift_1: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        start_shift_2: {
            type: DataTypes.DATE,

        },
        end_shift_2: {
            type: DataTypes.DATE,

        },
        profile_views: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        is_verified: {
            type: DataTypes.STRING(1),
            allowNull: false,
            defaultValue: 'N',
        },
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
