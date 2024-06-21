const express = require('express');
const cron = require('node-cron');
const passport = require('passport');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const searchRoutes = require('./routes/search');
const advisorRoutes = require('./routes/advisor');
const investorRoutes = require('./routes/investor');
const appointmentRoutes = require('./routes/appointment');
const reviewRoutes = require('./routes/review');
const messageRoutes = require('./routes/message');
const serviceRoutes = require('./routes/service');
const qualificationRoutes = require('./routes/qualification');
const helmet = require('helmet');

const setupSwagger = require('./swagger');

const cors = require('cors');

require('./config/passport');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: 'http://localhost:3000',
  }));
}

const updateCompletedAppointments = require('./utils/updateAppointmentBatch');

const cronExpr = process.env.NODE_ENV === 'development' ? '*/2 * * * *' : '*/30 * * * *';

// Schedule the task to run every 30 minutes
cron.schedule(cronExpr, () => {
  updateCompletedAppointments();
});


app.use(helmet());
app.use(bodyParser.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/qualifications', qualificationRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 4000;



if (process.env.NODE_ENV !== 'test') {
  console.log('ENV: ', process.env.NODE_ENV);
  setupSwagger(app);
  app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
  });

}


module.exports = app;