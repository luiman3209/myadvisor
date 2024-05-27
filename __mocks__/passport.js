// __mocks__/passport.js
const passport = jest.genMockFromModule('passport');

passport.initialize = jest.fn(() => (req, res, next) => {
  next();
});

passport.authenticate = (strategy, options, callback) => {
  return (req, res, next) => {
    if (callback) {
      callback(null, { id: 'mockUser', email: 'mock@user.com', role: 'mockRole' }, null); // Mock authenticated user
    }
    req.user = { id: 'mockUser', email: 'mock@user.com', role: 'mockRole' }; // Mock user object
    next();
  };
};

module.exports = passport;
