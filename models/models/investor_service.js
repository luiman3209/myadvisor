const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('investor_service', {
        investor_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'investors',
                key: 'investor_id',
            },
            onDelete: 'CASCADE',
            primaryKey: true,
        },
        service_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'service_types',
                key: 'service_id',
            },
            onDelete: 'CASCADE',
            primaryKey: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        timestamps: false,
    });
};
