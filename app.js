const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const searchRoutes = require('./routes/search');
const advisorRoutes = require('./routes/advisor');
const investorRoutes = require('./routes/investor');
const appointmentRoutes = require('./routes/appointment');
const dashboardRoutes = require('./routes/dashboard');
//const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/message');
const serviceRoutes = require('./routes/service');
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

app.use(helmet());
app.use(bodyParser.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
//app.use('/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/services', serviceRoutes);

const PORT = process.env.PORT || 4000;

const insertExampleServiceTypes = async () => {
  const serviceTypes = [
    {
      service_type_name: 'Retirement Planning',
      service_type_code: 'RETIREMENT_PLANNING',
      is_active: 'Y',
    },
    {
      service_type_name: 'Investment Management',
      service_type_code: 'INVESTMENT_MANAGEMENT',
      is_active: 'Y',
    },
    {
      service_type_name: 'Tax Planning',
      service_type_code: 'TAX_PLANNING',
      is_active: 'Y',
    },
    {
      service_type_name: 'Estate Planning',
      service_type_code: 'ESTATE_PLANNING',
      is_active: 'Y',
    },
    {
      service_type_name: 'Insurance Planning',
      service_type_code: 'INSURANCE_PLANNING',
      is_active: 'Y',
    },
    {
      service_type_name: 'Education Planning',
      service_type_code: 'EDUCATION_PLANNING',
      is_active: 'Y',
    },
    {
      service_type_name: 'Debt Management',
      service_type_code: 'DEBT_MANAGEMENT',
      is_active: 'Y',
    },
    {
      service_type_name: 'Small Business Planning',
      service_type_code: 'SMALL_BUSINESS_PLANNING',
      is_active: 'Y',
    },
    {
      service_type_name: 'Divorce Planning',
      service_type_code: 'DIVORCE_PLANNING',
      is_active: 'Y',
    },
    {
      service_type_name: 'Elder Care Planning',
      service_type_code: 'ELDER_CARE_PLANNING',
      is_active: 'Y',
    },
    {
      service_type_name: 'Charitable Giving and Philanthropy',
      service_type_code: 'CHARITABLE_GIVING_AND_PHILANTHROPY',
      is_active: 'Y',
    },
    {
      service_type_name: 'Behavioral Finance',
      service_type_code: 'BEHAVIORAL_FINANCE',
      is_active: 'Y',
    },
    {
      service_type_name: 'Wealth Management',
      service_type_code: 'WEALTH_MANAGEMENT',
      is_active: 'Y',
    },
    {
      service_type_name: 'Risk Management',
      service_type_code: 'RISK_MANAGEMENT',
      is_active: 'Y',
    },
    {
      service_type_name: 'Financial Education and Coaching',
      service_type_code: 'FINANCIAL_EDUCATION_AND_COACHING',
      is_active: 'Y',
    },
  ];

  for (const type of serviceTypes) {
    await ServiceType.findOrCreate({
      where: { service_type_code: type.service_type_code },
      defaults: type,
    });
  }

  console.log('Example service types have been inserted or already exist');
};


if (process.env.NODE_ENV !== 'test') {
  console.log('ENV: ', process.env.NODE_ENV);
  setupSwagger(app);
  app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
  });

}


module.exports = app;