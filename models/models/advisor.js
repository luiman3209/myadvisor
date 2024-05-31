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
        office_address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        operating_city_code: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        operating_country_code: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        qualifications: DataTypes.TEXT,
        expertise: DataTypes.TEXT,
        contact_information: DataTypes.TEXT,
        start_shift_1: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                isIn: [[
                    '0000', '0030', '0100', '0130', '0200', '0230', '0300', '0330', '0400', '0430', '0500', '0530', '0600', '0630', '0700', '0730', '0800', '0830', '0900', '0930', '1000', '1030', '1100', '1130',
                    '1200', '1230', '1300', '1330', '1400', '1430', '1500', '1530', '1600', '1630', '1700', '1730', '1800', '1830', '1900', '1930', '2000', '2030', '2100', '2130', '2200', '2230', '2300', '2330'
                  ]],
            },
        },
        end_shift_1: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                isIn: [[
                    '0000', '0030', '0100', '0130', '0200', '0230', '0300', '0330', '0400', '0430', '0500', '0530', '0600', '0630', '0700', '0730', '0800', '0830', '0900', '0930', '1000', '1030', '1100', '1130',
                    '1200', '1230', '1300', '1330', '1400', '1430', '1500', '1530', '1600', '1630', '1700', '1730', '1800', '1830', '1900', '1930', '2000', '2030', '2100', '2130', '2200', '2230', '2300', '2330'
                  ]],
            },
        },
        start_shift_2: {
            type: DataTypes.TEXT,
            validate: {
                isIn: [[
                    '0000', '0030', '0100', '0130', '0200', '0230', '0300', '0330', '0400', '0430', '0500', '0530', '0600', '0630', '0700', '0730', '0800', '0830', '0900', '0930', '1000', '1030', '1100', '1130',
                    '1200', '1230', '1300', '1330', '1400', '1430', '1500', '1530', '1600', '1630', '1700', '1730', '1800', '1830', '1900', '1930', '2000', '2030', '2100', '2130', '2200', '2230', '2300', '2330'
                  ]],
            },

        },
        end_shift_2: {
            type: DataTypes.TEXT,
            validate: {
                isIn: [[
                    '0000', '0030', '0100', '0130', '0200', '0230', '0300', '0330', '0400', '0430', '0500', '0530', '0600', '0630', '0700', '0730', '0800', '0830', '0900', '0930', '1000', '1030', '1100', '1130',
                    '1200', '1230', '1300', '1330', '1400', '1430', '1500', '1530', '1600', '1630', '1700', '1730', '1800', '1830', '1900', '1930', '2000', '2030', '2100', '2130', '2200', '2230', '2300', '2330'
                  ]],
            },

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
        img_url: DataTypes.TEXT,
    }, {
        timestamps: false,
    });
};
