const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('profiles', {
        profile_id: {
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
        first_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        address: DataTypes.TEXT,
        visibility: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'public',
            validate: {
                isIn: [['public', 'private']],
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
