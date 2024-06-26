// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MyAdvisor API',
      version: '1.0.0',
      description: 'API documentation for the MyAdvisor API',
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Admin', description: 'Admin endpoints' },
      { name: 'Advisor', description: 'Advisor endpoints' },
      { name: 'Investor', description: 'Investor endpoints' },
      { name: 'Appointment', description: 'Appointment endpoints' },
      { name: 'Messages', description: 'Messages endpoints' },
      { name: 'Profile', description: 'Profile endpoints' },
      { name: 'Search', description: 'Search endpoints' },
      { name: 'Service', description: 'Services endpoints' },
      { name: 'Reviews', description: 'Reviews endpoints' },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
