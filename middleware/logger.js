const logger = (req, res, next) => {
  console.log(
    `${new Date().toUTCString()}: ${req.method} ${req.originalUrl} ${
      req.session.isAuthenticated
        ? "Authenticated User"
        : "Unauthenticated user"
    } `
  );
  next();
};

module.exports = logger;
