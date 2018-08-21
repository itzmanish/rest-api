var userAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  next(null);
};

module.exports = userAuthenticated;
