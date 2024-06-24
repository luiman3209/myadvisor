// rateLimiter.js
const rateLimit = require('express-rate-limit');

// Define the rate limit settings
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again after 15 minutes',
    headers: true, // Send rate limit info in the headers
});

module.exports = apiLimiter;
