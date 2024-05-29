const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('investors', {
        investor_id: {
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
        net_worth: {
            type: DataTypes.STRING(100),
            validate: {
                isIn: [['<50000', '50000-99999', '100000-199999', '200000-499999', '500000-999999', '1000000-4999999', '5000000-9999999',
                    '10000000-49999999', '50000000-99999999', '100000000-499999999', '500000000-999999999', '>1000000000']]
            },
        },
        income_range: {
            type: DataTypes.STRING(50),
            validate: {
                isIn: [['<25000', '25000-49999', '50000-74999', '75000-99999', '100000-149999', '150000-199999', '>200000']]
            },
        },
        financial_goals: {
            type: DataTypes.STRING(300),
            validate: {
                isIn: [['retirement_planning', 'investment_management', 'tax_planning', 'estate_planning', 'insurance_planning', 'education_planning', 'debt_management', 'small_business_planning', 'divorce_planning', 'elder_care_planning', 'charitable_giving_and_philanthropy', 'behavioral_finance', 'wealth_management', 'risk_management', 'financial_education_and_coaching']]
            },
        },
        geo_preferences: {
            type: DataTypes.STRING,
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
