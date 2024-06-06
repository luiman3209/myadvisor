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
        },
        qualification_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'qualifications',
                key: 'id',
            },
            field: 'qualification_id',
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'updated_at'
        },
    }, {
        timestamps: true,
        primaryKey: ['advisor_id', 'qualification_id'],
    });
};
