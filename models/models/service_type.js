const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('service_types', {
        service_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        service_type_name: {
            type: DataTypes.TEXT,
            unique: true,
            allowNull: false,
        },
        service_type_code: {
            type: DataTypes.TEXT,
            unique: true,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.STRING(1),
            allowNull: false,
            defaultValue: 'Y',
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
