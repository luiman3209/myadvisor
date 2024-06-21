'use strict';

require('dotenv').config();
const Sequelize = require('sequelize');
const process = require('process');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '/../config/config.json'))[env];

let sequelize;

if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const User = require('./user')(sequelize);
const Profile = require('./profile')(sequelize);
const Advisor = require('./advisor')(sequelize);
const Qualification = require('./qualification')(sequelize);
const AdvisorQualification = require('./advisor_qualification')(sequelize);
const Investor = require('./investor')(sequelize);
const Appointment = require('./appointment')(sequelize);
const Review = require('./review')(sequelize);
const Message = require('./message')(sequelize);
const ServiceType = require('./service_type')(sequelize);
const AdvisorService = require('./advisor_service')(sequelize);
const InvestorService = require('./investor_service')(sequelize);

User.hasOne(Profile, { foreignKey: 'user_id' });
Profile.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Advisor, { foreignKey: 'user_id' });
Advisor.belongsTo(User, { foreignKey: 'user_id' });
Advisor.belongsTo(Profile, { foreignKey: 'user_id', targetKey: 'user_id' });

User.hasOne(Investor, { foreignKey: 'user_id' });
Investor.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Appointment, { foreignKey: 'user_id' });
Appointment.belongsTo(User, { foreignKey: 'user_id' });

Advisor.hasMany(Appointment, { foreignKey: 'advisor_id' });
Appointment.belongsTo(Advisor, { foreignKey: 'advisor_id' });

User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

Advisor.hasMany(Review, { foreignKey: 'advisor_id' });
Review.belongsTo(Advisor, { foreignKey: 'advisor_id' });

Appointment.hasOne(Review, { foreignKey: 'appointment_id' });
Review.belongsTo(Appointment, { foreignKey: 'appointment_id' });

User.hasMany(Message, { foreignKey: 'sender_id' });
User.hasMany(Message, { foreignKey: 'receiver_id' });
Message.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });
Message.belongsTo(User, { as: 'Receiver', foreignKey: 'receiver_id' });

Advisor.belongsToMany(ServiceType, { through: AdvisorService, foreignKey: 'advisor_id' });
ServiceType.belongsToMany(Advisor, { through: AdvisorService, foreignKey: 'service_id' });
Advisor.hasMany(AdvisorService, { foreignKey: 'advisor_id' });
AdvisorService.belongsTo(Advisor, { foreignKey: 'advisor_id' });


Advisor.belongsToMany(Qualification, { through: AdvisorQualification, foreignKey: 'advisor_id', as: 'AdvisorQualifications' });
Qualification.belongsToMany(Advisor, { through: AdvisorQualification, foreignKey: 'qualification_id', as: 'QualificationAdvisors' });
Advisor.hasMany(AdvisorQualification, { foreignKey: 'advisor_id', as: 'AdvisorQualificationRecords' });
AdvisorQualification.belongsTo(Advisor, { foreignKey: 'advisor_id', as: 'Advisor' });
Qualification.hasMany(AdvisorQualification, { foreignKey: 'qualification_id', as: 'QualificationRecords' });
AdvisorQualification.belongsTo(Qualification, { foreignKey: 'qualification_id', as: 'Qualification' });


Investor.belongsToMany(ServiceType, { through: InvestorService, foreignKey: 'investor_id' });
ServiceType.belongsToMany(Investor, { through: InvestorService, foreignKey: 'service_id' });
Investor.hasMany(InvestorService, { foreignKey: 'investor_id' });
InvestorService.belongsTo(Investor, { foreignKey: 'investor_id' });

if (env === 'test' || (env === 'development' && !config.use_env_variable)) {
    sequelize.sync({ force: true }).then(async () => {
        const service = await ServiceType.create({ service_type_name: 'Retirement Planning', service_type_code: 'RETIREMENT_PLANNING', is_active: 'Y' });
        await ServiceType.create({ service_type_name: 'Investment Management', service_type_code: 'INVESTMENT_MANAGEMENT', is_active: 'Y' });
        await ServiceType.create({ service_type_name: 'Tax Planning', service_type_code: 'TAX_PLANNING', is_active: 'Y' });
        await ServiceType.create({ service_type_name: 'Estate Planning', service_type_code: 'ESTATE_PLANNING', is_active: 'Y' });
        await ServiceType.create({ service_type_name: 'Insurance Planning', service_type_code: 'INSURANCE_PLANNING', is_active: 'Y' });
        await ServiceType.create({ service_type_name: 'Education Planning', service_type_code: 'EDUCATION_PLANNING', is_active: 'Y' });
        await ServiceType.create({ service_type_name: 'Debt Management', service_type_code: 'DEBT_MANAGEMENT', is_active: 'Y' });
        await ServiceType.create({ service_type_name: 'Small Business Planning', service_type_code: 'SMALL_BUSINESS_PLANNING', is_active: 'Y' });

        await Qualification.create({ qualification_id: 1, abbreviation: 'MBA', qualification_name: 'MBA', is_active: 'Y' });
        await Qualification.create({ qualification_id: 2, abbreviation: 'CFA', qualification_name: 'CFA', is_active: 'Y' });
        await Qualification.create({ qualification_id: 3, abbreviation: 'CFP', qualification_name: 'CFP', is_active: 'Y' });
        await Qualification.create({ qualification_id: 4, abbreviation: 'CPA', qualification_name: 'CPA', is_active: 'Y' });
        await Qualification.create({ qualification_id: 5, abbreviation: 'JD', qualification_name: 'JD', is_active: 'Y' });


        const user = await User.create({
            user_id: 1,
            email: 'a@b.it',
            password_hash: 'password',
            role: 'advisor',
        });

        const user2 = await User.create({
            user_id: 2,
            email: 'a@a',
            password_hash: 'aaaaaa',
            role: 'investor',
        });

        await Profile.create({
            profile_id: 1,
            user_id: user.user_id,
            first_name: 'John',
            last_name: 'Doe',
            phone_number: '1234567890',
        });

        await Profile.create({
            profile_id: 2,
            user_id: user2.user_id,
            first_name: 'John',
            last_name: 'Doe',
            phone_number: '1234567891',
        });

        const advisor = await Advisor.create({

            user_id: user.user_id,
            operating_country_code: 'US',
            operating_city_code: '12345',
            office_address: 'Via stupenda, 20',
            display_name: 'Pino Ciao',
            start_shift_1: '0800',
            end_shift_1: '1600',
            contact_information: 'ciao',
        });

        const investor = await Investor.create({
            user_id: user2.user_id,
            net_worth: '100000-199999',
            income_range: '75000-99999',
            geo_preferences: 'North America',
        });


        await AdvisorService.create({
            advisor_id: advisor.advisor_id,
            service_id: service.service_id,
        });


        console.log('Tables created');
    }).catch(error => {
        console.error('Unable to create tables:', error);
    });
}

module.exports = {
    sequelize,
    User,
    Profile,
    Advisor,
    Investor,
    Appointment,
    Review,
    Message,
    ServiceType,
    AdvisorService,
    InvestorService,
    Qualification,
    AdvisorQualification,

};
