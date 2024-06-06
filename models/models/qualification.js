const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('qualifications', {
        qualification_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        qualification_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        abbreviation: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
    }, {
        timestamps: false,
    });
};
