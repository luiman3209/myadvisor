'use strict';

require('dotenv').config();
const Sequelize = require('sequelize');
const process = require('process');
const path = require('path');
const faker = require('faker');



const env = process.env.NODE_ENV || 'development';

const initData = process.env.INIT_DATA || 'false';

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

        console.log('Tables created');
    }).catch(error => {
        console.error('Unable to create tables:', error);
    });

}



const initDemoDb = async () => {

    // Clear all data

    await AdvisorService.destroy({ where: {} });
    await InvestorService.destroy({ where: {} });
    await AdvisorQualification.destroy({ where: {} });
    await Review.destroy({ where: {} });
    await Appointment.destroy({ where: {} });
    await ServiceType.destroy({ where: {} });
    await Qualification.destroy({ where: {} });

    await Advisor.destroy({ where: {} });
    await Investor.destroy({ where: {} });
    await Profile.destroy({ where: {} });
    await User.destroy({ where: {} });

    console.log('Data cleared');


    const retirementPlanningSrvice = await ServiceType.create({ service_type_name: 'Retirement Planning', service_type_code: 'RETIREMENT_PLANNING', is_active: 'Y' });
    const investmentManagementSrvice = await ServiceType.create({ service_type_name: 'Investment Management', service_type_code: 'INVESTMENT_MANAGEMENT', is_active: 'Y' });
    const taxPlanningSrvice = await ServiceType.create({ service_type_name: 'Tax Planning', service_type_code: 'TAX_PLANNING', is_active: 'Y' });
    const estatePlanningSrvice = await ServiceType.create({ service_type_name: 'Estate Planning', service_type_code: 'ESTATE_PLANNING', is_active: 'Y' });
    const insurancePlanningSrvice = await ServiceType.create({ service_type_name: 'Insurance Planning', service_type_code: 'INSURANCE_PLANNING', is_active: 'Y' });
    const educationPlanningSrvice = await ServiceType.create({ service_type_name: 'Education Planning', service_type_code: 'EDUCATION_PLANNING', is_active: 'Y' });
    const debtManagementSrvice = await ServiceType.create({ service_type_name: 'Debt Management', service_type_code: 'DEBT_MANAGEMENT', is_active: 'Y' });
    const smallBusinessPlanningSrvice = await ServiceType.create({ service_type_name: 'Small Business Planning', service_type_code: 'SMALL_BUSINESS_PLANNING', is_active: 'Y' });
    const divorcePlanningSrvice = await ServiceType.create({ service_type_name: 'Divorce Planning', service_type_code: 'DIVORCE_PLANNING', is_active: 'Y' });
    const elderCarePlanningSrvice = await ServiceType.create({ service_type_name: 'Elder Care Planning', service_type_code: 'ELDER_CARE_PLANNING', is_active: 'Y' });
    const charitableGivingAndPhilanthropySrvice = await ServiceType.create({ service_type_name: 'Charitable Giving And Philanthropy', service_type_code: 'CHARITABLE_GIVING_AND_PHILANTHROPY', is_active: 'Y' });
    const behavioralFinanceSrvice = await ServiceType.create({ service_type_name: 'Behavioral Finance', service_type_code: 'BEHAVIORAL_FINANCE', is_active: 'Y' });
    const wealthManagementSrvice = await ServiceType.create({ service_type_name: 'Wealth Management', service_type_code: 'WEALTH_MANAGEMENT', is_active: 'Y' });
    const riskManagementSrvice = await ServiceType.create({ service_type_name: 'Risk Management', service_type_code: 'RISK_MANAGEMENT', is_active: 'Y' });
    const financialEducationAndCoachingSrvice = await ServiceType.create({ service_type_name: 'Financial Education And Coaching', service_type_code: 'FINANCIAL_EDUCATION_AND_COACHING', is_active: 'Y' });

    console.log('Service types created');


    const mba = await Qualification.create({ qualification_id: 1, abbreviation: 'MBA', qualification_name: 'MBA', is_active: 'Y' });
    const cfa = await Qualification.create({ qualification_id: 2, abbreviation: 'CFA', qualification_name: 'CFA', is_active: 'Y' });
    const cfp = await Qualification.create({ qualification_id: 3, abbreviation: 'CFP', qualification_name: 'CFP', is_active: 'Y' });
    const cpa = await Qualification.create({ qualification_id: 4, abbreviation: 'CPA', qualification_name: 'CPA', is_active: 'Y' });
    const cima = await Qualification.create({ qualification_id: 5, abbreviation: 'CIMA', qualification_name: 'CIMA', is_active: 'Y' });
    const cfs = await Qualification.create({ qualification_id: 6, abbreviation: 'CFS', qualification_name: 'CFS', is_active: 'Y' });
    const cpwa = await Qualification.create({ qualification_id: 7, abbreviation: 'CPWA', qualification_name: 'CPWA', is_active: 'Y' });
    const clu = await Qualification.create({ qualification_id: 8, abbreviation: 'CLU', qualification_name: 'CLU', is_active: 'Y' });
    const chfc = await Qualification.create({ qualification_id: 9, abbreviation: 'ChFC', qualification_name: 'ChFC', is_active: 'Y' });
    const frm = await Qualification.create({ qualification_id: 10, abbreviation: 'FRM', qualification_name: 'FRM', is_active: 'Y' });
    const aams = await Qualification.create({ qualification_id: 11, abbreviation: 'AAMS', qualification_name: 'AAMS', is_active: 'Y' });
    const series6 = await Qualification.create({ qualification_id: 12, abbreviation: 'Series 6', qualification_name: 'Series 6 License', is_active: 'Y' });
    const series7 = await Qualification.create({ qualification_id: 13, abbreviation: 'Series 7', qualification_name: 'Series 7 License', is_active: 'Y' });
    const series65 = await Qualification.create({ qualification_id: 14, abbreviation: 'Series 65', qualification_name: 'Series 65 License', is_active: 'Y' });
    const series66 = await Qualification.create({ qualification_id: 15, abbreviation: 'Series 66', qualification_name: 'Series 66 License', is_active: 'Y' });
    const ctfa = await Qualification.create({ qualification_id: 16, abbreviation: 'CTFA', qualification_name: 'Certified Trust and Fiduciary Advisor', is_active: 'Y' });
    const aif = await Qualification.create({ qualification_id: 17, abbreviation: 'AIF', qualification_name: 'Accredited Investment Fiduciary', is_active: 'Y' });
    const ricp = await Qualification.create({ qualification_id: 18, abbreviation: 'RICP', qualification_name: 'Retirement Income Certified Professional', is_active: 'Y' });
    const crc = await Qualification.create({ qualification_id: 19, abbreviation: 'CRC', qualification_name: 'Certified Retirement Counselor', is_active: 'Y' });

    console.log('Qualifications created');

    // Function to get a random item from an array
    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Generate a function to create a random int within a range
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Function to create a random alphanumerical string of 10 characters 
    const randomString = () => Math.random().toString(36).substring(2, 12);

    // Predefined data
    const serviceTypes = [
        retirementPlanningSrvice, investmentManagementSrvice, taxPlanningSrvice, estatePlanningSrvice,
        insurancePlanningSrvice, educationPlanningSrvice, debtManagementSrvice, smallBusinessPlanningSrvice,
        divorcePlanningSrvice, elderCarePlanningSrvice, charitableGivingAndPhilanthropySrvice, behavioralFinanceSrvice,
        wealthManagementSrvice, riskManagementSrvice, financialEducationAndCoachingSrvice
    ];

    const qualifications = [mba, cfa, cfp, cpa, cima, cfs, cpwa, clu, chfc, frm, aams, series6, series7, series65, series66, ctfa, aif, ricp, crc];

    const stateCodes = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

    const times = ['0800', '0830', '0900', '0930', '1000', '1030', '1100', '1130', '1200', '1230', '1300', '1330', '1400', '1430', '1500', '1530', '1600', '1630', '1700', '1730', '1800', '1830', '1900', '1930', '2000', '2030', '2100', '2130', '2200', '2230'];

    // Predefined data for investors
    const netWorthOptions = [
        '<50000', '50000-99999', '100000-199999', '200000-499999',
        '500000-999999', '1000000-4999999', '5000000-9999999',
        '10000000-49999999', '50000000-99999999',
        '100000000-499999999', '500000000-999999999', '>1000000000'
    ];
    const incomeRangeOptions = [
        '<25000', '25000-49999', '50000-74999', '75000-99999',
        '100000-149999', '150000-199999', '>200000'
    ];


    let idCounter = 1;

    let usedEmails = [];

    async function createAdvisor(firstName, lastName, email) {
        const user = await User.create({
            user_id: idCounter,
            email: email,
            password_hash: randomString(),
            role: 'advisor',
        });

        idCounter++;

        await Profile.create({
            profile_id: faker.datatype.number(),
            user_id: user.user_id,
            first_name: firstName,
            last_name: lastName,
            phone_number: faker.phone.phoneNumber().substring(0, 15),
        });

        const advisor = await Advisor.create({
            user_id: user.user_id,
            operating_country_code: getRandomItem(stateCodes),
            operating_city_code: faker.address.zipCode(),
            office_address: faker.address.streetAddress(),
            display_name: `${firstName} ${lastName}`,
            start_shift_1: '0800',
            end_shift_1: '1600',
            contact_information: faker.internet.email(firstName, lastName),
        });

        let alreadyAssigned = [];
        // Assign random services
        for (let i = 0; i < randomInt(1, 5); i++) {
            const serviceId = getRandomItem(serviceTypes).service_id;
            if (!alreadyAssigned.includes(serviceId)) {
                await AdvisorService.create({
                    advisor_id: advisor.advisor_id,
                    service_id: serviceId,
                });
                alreadyAssigned.push(serviceId);
            }

        }

        alreadyAssigned = [];
        // Assign random qualifications
        for (let i = 0; i < randomInt(1, 3); i++) {
            const qualificationId = getRandomItem(qualifications).qualification_id;
            if (!alreadyAssigned.includes(qualificationId)) {
                await AdvisorQualification.create({
                    advisor_id: advisor.advisor_id,
                    qualification_id: qualificationId,
                });
                alreadyAssigned.push(qualificationId);
            }

        }

        return advisor.advisor_id;
    }

    async function createInvestor(firstName, lastName, email) {
        const user = await User.create({
            user_id: idCounter,
            email: email,
            password_hash: randomString(),
            role: 'investor',
        });

        idCounter++;

        await Profile.create({
            profile_id: faker.datatype.number(),
            user_id: user.user_id,
            first_name: firstName,
            last_name: lastName,
            phone_number: faker.phone.phoneNumber().substring(0, 15),
        });

        const investor = await Investor.create({
            user_id: user.user_id,
            net_worth: getRandomItem(netWorthOptions),
            income_range: getRandomItem(incomeRangeOptions),
            geo_preferences: getRandomItem(stateCodes),
        });

        const alreadyAssigned = [];
        // Assign random services
        for (let i = 0; i < randomInt(1, 4); i++) {
            const serviceId = getRandomItem(serviceTypes).service_id;
            if (!alreadyAssigned.includes(serviceId)) {
                await InvestorService.create({
                    investor_id: investor.investor_id,
                    service_id: serviceId,
                });
                alreadyAssigned.push(serviceId);
            }

        }

        return user.user_id;
    }


    // Create two new advisors with random data
    const advisor_id_1 = await createAdvisor('Jane', 'Smith', 'jane_smith@example.com');
    const advisor_id_2 = await createAdvisor('Mark', 'Johnson', 'mark_johnson@example.com');
    const advisor_id_3 = await createAdvisor('Emma', 'Williams', 'emma_williams@example.com');
    const advisor_id_4 = await createAdvisor('Liam', 'Brown', 'liam_brown@example.com');
    const advisor_id_5 = await createAdvisor('Olivia', 'Jones', 'olivia_jones@example.com');
    const advisor_id_6 = await createAdvisor('Noah', 'Garcia', 'noah_garcia@example.com');
    const advisor_id_7 = await createAdvisor('Ava', 'Miller', 'ava_miller@example.com');
    const advisor_id_8 = await createAdvisor('Elijah', 'Davis', 'elijah_davis@example.com');
    const advisor_id_9 = await createAdvisor('Sophia', 'Rodriguez', 'sophia_rodriguez@example.com');
    const advisor_id_10 = await createAdvisor('James', 'Martinez', 'james_martinez@example.com');
    await createAdvisor('Isabella', 'Hernandez', 'isabella_hernandez@example.com');
    await createAdvisor('William', 'Lopez', 'william_lopez@example.com');
    await createAdvisor('Mia', 'Gonzalez', 'mia_gonzalez@example.com');
    await createAdvisor('Benjamin', 'Wilson', 'benjamin_wilson@example.com');
    await createAdvisor('Charlotte', 'Anderson', 'charlotte_anderson@example.com');
    await createAdvisor('Lucas', 'Thomas', 'lucas_thomas@example.com');
    await createAdvisor('Amelia', 'Taylor', 'amelia_taylor@example.com');
    await createAdvisor('Henry', 'Moore', 'henry_moore@example.com');
    await createAdvisor('Evelyn', 'Jackson', 'evelyn_jackson@example.com');
    await createAdvisor('Alexander', 'Martin', 'alexander_martin@example.com');
    await createAdvisor('Harper', 'Lee', 'harper_lee@example.com');
    await createAdvisor('Michael', 'Perez', 'michael_perez@example.com');
    await createAdvisor('Luna', 'Thompson', 'luna_thompson@example.com');
    await createAdvisor('Daniel', 'White', 'daniel_white@example.com');
    await createAdvisor('Ella', 'Harris', 'ella_harris@example.com');
    await createAdvisor('Matthew', 'Sanchez', 'matthew_sanchez@example.com');
    await createAdvisor('Grace', 'Clark', 'grace_clark@example.com');
    await createAdvisor('Joseph', 'Ramirez', 'joseph_ramirez@example.com');
    await createAdvisor('Victoria', 'Lewis', 'victoria_lewis@example.com');
    await createAdvisor('Samuel', 'Robinson', 'samuel_robinson@example.com');
    await createAdvisor('Scarlett', 'Walker', 'scarlett_walker@example.com');
    await createAdvisor('David', 'Young', 'david_young@example.com');
    await createAdvisor('Aria', 'Allen', 'aria_allen@example.com');
    await createAdvisor('Carter', 'King', 'carter_king@example.com');
    await createAdvisor('Hannah', 'Wright', 'hannah_wright@example.com');
    await createAdvisor('Sebastian', 'Scott', 'sebastian_scott@example.com');
    await createAdvisor('Addison', 'Torres', 'addison_torres@example.com');
    await createAdvisor('Logan', 'Nguyen', 'logan_nguyen@example.com');
    await createAdvisor('Aubrey', 'Hill', 'aubrey_hill@example.com');
    await createAdvisor('Owen', 'Flores', 'owen_flores@example.com');
    await createAdvisor('Zoey', 'Green', 'zoey_green@example.com');
    await createAdvisor('Jackson', 'Adams', 'jackson_adams@example.com');
    await createAdvisor('Penelope', 'Nelson', 'penelope_nelson@example.com');
    await createAdvisor('Levi', 'Baker', 'levi_baker@example.com');
    await createAdvisor('Madelyn', 'Hall', 'madelyn_hall@example.com');
    await createAdvisor('Isaac', 'Rivera', 'isaac_rivera@example.com');
    await createAdvisor('Layla', 'Campbell', 'layla_campbell@example.com');
    await createAdvisor('Aiden', 'Mitchell', 'aiden_mitchell@example.com');
    await createAdvisor('Riley', 'Carter', 'riley_carter@example.com');
    await createAdvisor('John', 'Roberts', 'john_roberts@example.com');
    await createAdvisor('Nora', 'Gomez', 'nora_gomez@example.com');
    await createAdvisor('Gabriel', 'Phillips', 'gabriel_phillips@example.com');
    await createAdvisor('Lily', 'Evans', 'lily_evans@example.com');
    await createAdvisor('Anthony', 'Turner', 'anthony_turner@example.com');
    await createAdvisor('Ellie', 'Diaz', 'ellie_diaz@example.com');
    await createAdvisor('Dylan', 'Parker', 'dylan_parker@example.com');
    await createAdvisor('Mila', 'Cruz', 'mila_cruz@example.com');
    await createAdvisor('Wyatt', 'Edwards', 'wyatt_edwards@example.com');
    await createAdvisor('Aurora', 'Collins', 'aurora_collins@example.com');
    await createAdvisor('Andrew', 'Reyes', 'andrew_reyes@example.com');
    await createAdvisor('Brooklyn', 'Stewart', 'brooklyn_stewart@example.com');
    await createAdvisor('Joshua', 'Morris', 'joshua_morris@example.com');
    await createAdvisor('Savannah', 'Morales', 'savannah_morales@example.com');
    await createAdvisor('Christopher', 'Murphy', 'christopher_murphy@example.com');
    await createAdvisor('Bella', 'Cook', 'bella_cook@example.com');
    await createAdvisor('Jack', 'Rogers', 'jack_rogers@example.com');
    await createAdvisor('Alice', 'Morgan', 'alice_morgan@example.com');
    await createAdvisor('Julian', 'Peterson', 'julian_peterson@example.com');
    await createAdvisor('Hazel', 'Cooper', 'hazel_cooper@example.com');
    await createAdvisor('Ryan', 'Bailey', 'ryan_bailey@example.com');
    await createAdvisor('Paisley', 'Reed', 'paisley_reed@example.com');
    await createAdvisor('Jaxon', 'Kelly', 'jaxon_kelly@example.com');
    await createAdvisor('Sadie', 'Howard', 'sadie_howard@example.com');
    await createAdvisor('Luke', 'Ramos', 'luke_ramos@example.com');
    await createAdvisor('Nora', 'Bell', 'nora_bell@example.com');
    await createAdvisor('Jayden', 'Perry', 'jayden_perry@example.com');
    await createAdvisor('Rylee', 'Foster', 'rylee_foster@example.com');
    await createAdvisor('Grayson', 'Bryant', 'grayson_bryant@example.com');
    await createAdvisor('Emery', 'Hamilton', 'emery_hamilton@example.com');
    await createAdvisor('Ethan', 'Russell', 'ethan_russell@example.com');
    await createAdvisor('Peyton', 'Griffin', 'peyton_griffin@example.com');
    await createAdvisor('Isaiah', 'Fernandez', 'isaiah_fernandez@example.com');
    await createAdvisor('Melody', 'Hayes', 'melody_hayes@example.com');
    await createAdvisor('Hudson', 'James', 'hudson_james@example.com');
    await createAdvisor('Julia', 'Butler', 'julia_butler@example.com');
    await createAdvisor('Maverick', 'Barnes', 'maverick_barnes@example.com');
    await createAdvisor('Willow', 'Jenkins', 'willow_jenkins@example.com');
    await createAdvisor('Josiah', 'Long', 'josiah_long@example.com');
    await createAdvisor('Violet', 'Price', 'violet_price@example.com');
    await createAdvisor('Caleb', 'Sanders', 'caleb_sanders@example.com');
    await createAdvisor('Aurora', 'Wood', 'aurora_wood@example.com');
    await createAdvisor('Eli', 'Wright', 'eli_wright@example.com');
    await createAdvisor('Ivy', 'Brooks', 'ivy_brooks@example.com');
    await createAdvisor('Nathan', 'Bennett', 'nathan_bennett@example.com');
    await createAdvisor('Anna', 'Gray', 'anna_gray@example.com');
    await createAdvisor('Aaron', 'Hughes', 'aaron_hughes@example.com');
    await createAdvisor('Clara', 'Reynolds', 'clara_reynolds@example.com');
    await createAdvisor('Adam', 'Ross', 'adam_ross@example.com');
    await createAdvisor('Athena', 'Powell', 'athena_powell@example.com');
    await createAdvisor('Robert', 'Sullivan', 'robert_sullivan@example.com');
    await createAdvisor('Lillian', 'Russell', 'lillian_russell@example.com');
    await createAdvisor('Thomas', 'Ortiz', 'thomas_ortiz@example.com');
    await createAdvisor('Mackenzie', 'Jenkins', 'mackenzie_jenkins@example.com');

    console.log('Advisors created')

    // Create two new investors with random data
    const investor_user_id_1 = await createInvestor('Alice', 'Williams', 'alice_williams@example.com');
    const investor_user_id_2 = await createInvestor('Bob', 'Brown', 'bob_white@example.com');
    const investor_user_id_3 = await createInvestor('Alice', 'Williams', 'alice_dickson@example.com');
    const investor_user_id_4 = await createInvestor('Bob', 'Brown', 'bob_brown@example.com');
    const investor_user_id_5 = await createInvestor('Charlie', 'Johnson', 'charlie_johnson@example.com');
    const investor_user_id_6 = await createInvestor('Daisy', 'Smith', 'daisy_smith@example.com');
    const investor_user_id_7 = await createInvestor('Edward', 'Jones', 'edward_jones@example.com');
    const investor_user_id_8 = await createInvestor('Fiona', 'Garcia', 'fiona_garcia@example.com');
    const investor_user_id_9 = await createInvestor('George', 'Miller', 'george_miller@example.com');
    const investor_user_id_10 = await createInvestor('Hannah', 'Davis', 'hannah_davis@example.com');
    const investor_user_id_11 = await createInvestor('Ian', 'Rodriguez', 'ian_rodriguez@example.com');
    const investor_user_id_12 = await createInvestor('Jasmine', 'Martinez', 'jasmine_martinez@example.com');

    console.log('Investors created')

    await Review.create({
        review_id: 1,
        advisor_id: advisor_id_1,
        user_id: investor_user_id_1,
        rating: 5,
        review: 'The advisor was extremely knowledgeable and provided invaluable guidance for my retirement planning. Highly recommended for anyone looking for financial advice.',
    });

    await Review.create({
        review_id: 2,
        advisor_id: advisor_id_2,
        user_id: investor_user_id_2,
        rating: 4,
        review: 'Very professional and responsive. Helped me make informed investment decisions and understand market trends better. Would definitely recommend to others.',
    });

    await Review.create({
        review_id: 3,
        advisor_id: advisor_id_3,
        user_id: investor_user_id_3,
        rating: 3,
        review: 'Overall good experience, but there were some delays in communication. The advisor\'s expertise is solid, but timely updates would improve the service significantly.',
    });

    await Review.create({
        review_id: 4,
        advisor_id: advisor_id_4,
        user_id: investor_user_id_4,
        rating: 5,
        review: 'Exceptional service! The advisor went above and beyond to tailor the financial plan to my specific needs. Couldn\'t be happier with the results.',
    });

    await Review.create({
        review_id: 5,
        advisor_id: advisor_id_5,
        user_id: investor_user_id_5,
        rating: 4,
        review: 'Great insights and practical advice on investment management. The advisor took the time to explain complex concepts in a simple manner. Highly appreciated.',
    });

    await Review.create({
        review_id: 6,
        advisor_id: advisor_id_6,
        user_id: investor_user_id_6,
        rating: 5,
        review: 'The advisor helped me navigate through my financial concerns with ease. Their strategic planning and thorough analysis made a significant difference in my financial outlook.',
    });

    await Review.create({
        review_id: 7,
        advisor_id: advisor_id_7,
        user_id: investor_user_id_7,
        rating: 4,
        review: 'Very attentive and detail-oriented. The advisor provided a comprehensive financial plan that covered all aspects of my financial life. Would recommend without hesitation.',
    });

    await Review.create({
        review_id: 8,
        advisor_id: advisor_id_8,
        user_id: investor_user_id_8,
        rating: 5,
        review: 'Outstanding service and exceptional advice. The advisor was always available to answer my questions and provided clear and actionable recommendations.',
    });

    await Review.create({
        review_id: 9,
        advisor_id: advisor_id_9,
        user_id: investor_user_id_9,
        rating: 3,
        review: 'The advisor is knowledgeable, but the service could improve in terms of response time. Despite this, the financial advice received was beneficial.',
    });

    await Review.create({
        review_id: 10,
        advisor_id: advisor_id_10,
        user_id: investor_user_id_10,
        rating: 5,
        review: 'Excellent advisor with deep understanding of financial markets. Their personalized approach and dedication have been instrumental in achieving my financial goals.',
    });

    await Review.create({
        review_id: 11,
        advisor_id: advisor_id_1,
        user_id: investor_user_id_11,
        rating: 4,
        review: 'The advisor provided great insights into my portfolio and helped diversify my investments effectively. Their approach is professional and client-focused.',
    });

    await Review.create({
        review_id: 12,
        advisor_id: advisor_id_2,
        user_id: investor_user_id_12,
        rating: 5,
        review: 'Extremely satisfied with the service. The advisor was very thorough and offered detailed explanations for all recommendations. A top-notch financial advisor!',
    });

    await Review.create({
        review_id: 13,
        advisor_id: advisor_id_3,
        user_id: investor_user_id_1,
        rating: 3,
        review: 'The advisor has good knowledge but could improve on proactive communication. Overall, the advice received was sound and useful.',
    });

    await Review.create({
        review_id: 14,
        advisor_id: advisor_id_4,
        user_id: investor_user_id_2,
        rating: 5,
        review: 'Outstanding experience! The advisor really listened to my concerns and provided tailored advice that has greatly improved my financial situation.',
    });

    await Review.create({
        review_id: 15,
        advisor_id: advisor_id_5,
        user_id: investor_user_id_3,
        rating: 4,
        review: 'The advisor was very helpful in setting up a comprehensive financial plan. They explained everything in detail and made sure I was comfortable with all decisions.',
    });

    await Review.create({
        review_id: 16,
        advisor_id: advisor_id_6,
        user_id: investor_user_id_4,
        rating: 5,
        review: 'Excellent service and in-depth financial knowledge. The advisor helped me optimize my investments and plan for long-term growth.',
    });

    await Review.create({
        review_id: 17,
        advisor_id: advisor_id_7,
        user_id: investor_user_id_5,
        rating: 4,
        review: 'Very pleased with the service. The advisor provided valuable insights and was always available to answer my questions.',
    });

    await Review.create({
        review_id: 18,
        advisor_id: advisor_id_8,
        user_id: investor_user_id_6,
        rating: 5,
        review: 'The advisor offered exceptional guidance and was very supportive throughout the entire process. I highly recommend their services.',
    });

    await Review.create({
        review_id: 19,
        advisor_id: advisor_id_9,
        user_id: investor_user_id_7,
        rating: 3,
        review: 'The advisor is knowledgeable but needs to work on communication and follow-ups. Despite this, the advice given was beneficial.',
    });

    await Review.create({
        review_id: 20,
        advisor_id: advisor_id_10,
        user_id: investor_user_id_8,
        rating: 4,
        review: 'Great service overall. The advisor helped me better understand my financial situation and made strategic recommendations to improve it.',
    });

    await Review.create({
        review_id: 21,
        advisor_id: advisor_id_1,
        user_id: investor_user_id_9,
        rating: 5,
        review: 'The advisor provided exceptional service and detailed financial advice. Their expertise has been invaluable in managing my investments.',
    });

    await Review.create({
        review_id: 22,
        advisor_id: advisor_id_2,
        user_id: investor_user_id_10,
        rating: 4,
        review: 'Very knowledgeable and professional. The advisor took the time to understand my needs and provided personalized financial guidance.',
    });

    await Review.create({
        review_id: 23,
        advisor_id: advisor_id_3,
        user_id: investor_user_id_11,
        rating: 5,
        review: 'Highly recommend this advisor! They offered great insights and practical advice that have greatly improved my financial health.',
    });

    await Review.create({
        review_id: 24,
        advisor_id: advisor_id_4,
        user_id: investor_user_id_12,
        rating: 4,
        review: 'The advisor provided solid advice and was very patient in explaining all aspects of the financial plan. Very satisfied with the service.',
    });

    await Review.create({
        review_id: 25,
        advisor_id: advisor_id_5,
        user_id: investor_user_id_1,
        rating: 5,
        review: 'Exceptional service and expertise. The advisor helped me navigate through complex financial decisions with ease and confidence.',
    });

    await Review.create({
        review_id: 26,
        advisor_id: advisor_id_6,
        user_id: investor_user_id_2,
        rating: 3,
        review: 'Good advice but the advisor could improve on responsiveness. Overall, I am happy with the financial guidance provided.',
    });

    await Review.create({
        review_id: 27,
        advisor_id: advisor_id_7,
        user_id: investor_user_id_3,
        rating: 5,
        review: 'The advisor was excellent in understanding my financial goals and provided tailored advice that perfectly suited my needs.',
    });

    await Review.create({
        review_id: 28,
        advisor_id: advisor_id_8,
        user_id: investor_user_id_4,
        rating: 4,
        review: 'Very satisfied with the service. The advisor was knowledgeable and provided comprehensive financial planning advice.',
    });

    await Review.create({
        review_id: 29,
        advisor_id: advisor_id_9,
        user_id: investor_user_id_5,
        rating: 5,
        review: 'Outstanding financial advisor! Their insights and strategic planning have been crucial in managing my investments effectively.',
    });

    await Review.create({
        review_id: 30,
        advisor_id: advisor_id_10,
        user_id: investor_user_id_6,
        rating: 4,
        review: 'Great experience overall. The advisor provided valuable advice and was always available to address my concerns.',
    });

    await Review.create({
        review_id: 31,
        advisor_id: advisor_id_1,
        user_id: investor_user_id_7,
        rating: 5,
        review: 'The advisor was incredibly knowledgeable and provided top-notch financial advice. I feel much more confident about my financial future.',
    });

    await Review.create({
        review_id: 32,
        advisor_id: advisor_id_2,
        user_id: investor_user_id_8,
        rating: 3,
        review: 'The advisor is well-informed but could be more proactive in communication. The financial advice was sound and helpful.',
    });

    await Review.create({
        review_id: 33,
        advisor_id: advisor_id_3,
        user_id: investor_user_id_9,
        rating: 4,
        review: 'Very professional and knowledgeable advisor. Provided clear and actionable financial advice that has been very beneficial.',
    });

    await Review.create({
        review_id: 34,
        advisor_id: advisor_id_4,
        user_id: investor_user_id_10,
        rating: 5,
        review: 'Excellent service! The advisor helped me understand my financial situation better and provided a clear path to achieving my goals.',
    });

    await Review.create({
        review_id: 35,
        advisor_id: advisor_id_5,
        user_id: investor_user_id_11,
        rating: 4,
        review: 'The advisor provided great financial advice and was very supportive throughout the process. Highly recommend their services.',
    });

    await Review.create({
        review_id: 36,
        advisor_id: advisor_id_6,
        user_id: investor_user_id_12,
        rating: 5,
        review: 'Exceptional advisor! Their in-depth knowledge and personalized approach have made a significant positive impact on my finances.',
    });

    await Review.create({
        review_id: 37,
        advisor_id: advisor_id_7,
        user_id: investor_user_id_1,
        rating: 3,
        review: 'The advisor is knowledgeable but needs to improve on timely responses. Overall, the financial advice provided was helpful.',
    });

    await Review.create({
        review_id: 38,
        advisor_id: advisor_id_8,
        user_id: investor_user_id_2,
        rating: 4,
        review: 'Very satisfied with the advisor\'s service. They provided detailed and easy-to-understand financial advice that has been very beneficial.',
    });

    await Review.create({
        review_id: 39,
        advisor_id: advisor_id_9,
        user_id: investor_user_id_3,
        rating: 5,
        review: 'Outstanding financial advisor! Their insights and strategic planning have been instrumental in achieving my financial goals.',
    });

    await Review.create({
        review_id: 40,
        advisor_id: advisor_id_10,
        user_id: investor_user_id_4,
        rating: 4,
        review: 'Great experience. The advisor provided valuable advice and was always available to address my questions and concerns.',
    });

    console.log('Reviews created')
};

if (env !== 'production' && initData === 'true') {
    console.log('Initializing demo data');
    initDemoDb();
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

