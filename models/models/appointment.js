const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('appointments', {
        appointment_id: {
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
        advisor_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'advisors',
                key: 'advisor_id',
            },
            onDelete: 'CASCADE',
        },

        service_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'service_types',
                key: 'service_id',
            },
            onDelete: 'CASCADE',
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        is_reviewed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['scheduled', 'confirmed', 'completed', 'canceled']],
            },
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
