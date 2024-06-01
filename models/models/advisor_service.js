const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('advisor_service', {
        advisor_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'advisors',
                key: 'advisor_id',
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
        tableName: 'advisor_service',
        timestamps: false,
    });
};
