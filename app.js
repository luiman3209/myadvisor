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

const setupSwagger = require('./swagger');

const cors = require('cors');
require('./config/passport');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: 'http://localhost:3000',
  }));
}

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

const PORT = process.env.PORT || 4000;

if(process.env.NODE_ENV === 'dev') {
  
  
 sequelize.sync().then(() => {
  setupSwagger(app);
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
}else if (process.env.NODE_ENV !== 'test'){

  setupSwagger(app);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

}


module.exports = app;