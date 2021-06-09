function authorizeUserType(type, sequelize) {
  if (type === 'teacher') {
    return (async (req, res, next) => {
      // Find teacher with id from request
      const user = await sequelize.models.User.findOne({
        where: {id: req.user.id}});
      req.teacher = await user.getTeacher();
      // Respond with authentication error if there is no teacher with that id.
      if (req.teacher === null) return res.sendStatus(401);

      // Continue to the next middleware function.
      next();
    });
  } else {
    return (async (req, res, next) => {
      // Find teacher with id from request
      const user = await sequelize.models.User.findOne({
        where: {id: req.user.id}});
      req.teacher = await user.getTeacher();
      // Respond with authentication error if there is no teacher with that id.
      if (req.teacher === null) return res.sendStatus(401);

      // Continue to the next middleware function.
      next();
    });
  }
}

module.exports = {
  authorizeUserType,
};
