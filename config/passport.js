const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { User } = require('../models/models');
const passport = require('passport');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findByPk(jwt_payload.id);
        if (user) {
            const plainUser = { id: user.user_id, email: user.email, role: user.role }; // Simplified user object
            return done(null, plainUser); // Return plain object instead of Sequelize model
        }
        return done(null, false);
    } catch (err) {
        return done(err, false);
    }
}));

module.exports = passport;
