function requireUser(req, res, next) {
  console.log(req)
  if (!req.user) {
    next({
      name: "MissingUserError",
      message: "You must be logged in to perform this action",
    });
  }

  next();
}

function requireActiveUser(req, res, next) {
  if (!req.user && req.active === false) {
    next({
      name: "MissingActiveUserError",
      message: "You must be an active user to perform this action",
    });
  }

  next();
}

module.exports = {
  requireUser,
  requireActiveUser,
};
