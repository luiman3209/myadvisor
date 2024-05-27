const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const searchRoutes = require('./routes/search');
const advisorRoutes = require('./routes/advisor');
const appointmentRoutes = require('./routes/appointment');
const dashboardRoutes = require('./routes/dashboard');
//const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/message');
const { sequelize } = require('./models/models');

require('./config/passport');

const app = express();

app.use(bodyParser.json());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/search', searchRoutes);
app.use('/advisor', advisorRoutes);
app.use('/appointment', appointmentRoutes);
app.use('/dashboard', dashboardRoutes);
//app.use('/payment', paymentRoutes);
app.use('/admin', adminRoutes);
app.use('/message', messageRoutes); // Add this line

const PORT = process.env.PORT || 3000;

//sequelize.sync().then(() => {
//    app.listen(PORT, () => {
//        console.log(`Server is running on port ${PORT}`);
//    });
//});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
module.exports = app;