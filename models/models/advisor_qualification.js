const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('advisor_qualifications', {
        advisor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'advisors',
                key: 'advisor_id',
            },
            field: 'advisor_id',
            onDelete: 'CASCADE',
        },
        qualification_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'qualifications',
                key: 'id',
            },
            field: 'qualification_id',
            onDelete: 'CASCADE',
        },

    }, {
        timestamps: false,
        primaryKey: ['advisor_id', 'qualification_id'],
    });
};
