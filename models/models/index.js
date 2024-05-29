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
const Investor = require('./investor')(sequelize);

const Appointment = require('./appointment')(sequelize);
const Review = require('./review')(sequelize);
const Message = require('./message')(sequelize);
const Payment = require('./payment')(sequelize);

User.hasOne(Profile, { foreignKey: 'user_id' });
Profile.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Advisor, { foreignKey: 'user_id' });
Advisor.belongsTo(User, { foreignKey: 'user_id' });

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

User.hasMany(Message, { foreignKey: 'sender_id' });
User.hasMany(Message, { foreignKey: 'receiver_id' });
Message.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });
Message.belongsTo(User, { as: 'Receiver', foreignKey: 'receiver_id' });

User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

Appointment.hasMany(Payment, { foreignKey: 'appointment_id' });
Payment.belongsTo(Appointment, { foreignKey: 'appointment_id' });

if (env === 'development' || env === 'test') {
    sequelize.sync({ force: true }).then(() => {
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
    Appointment,
    Review,
    Message,
    Payment,
};
