function authorizeUserType(type, sequelize) {
  // Return the relevant function depending on the type parameter.
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
  } else if (type === 'student') {
    return (async (req, res, next) => {
      // Find student with id from request
      const user = await sequelize.models.User.findOne({
        where: {id: req.user.id}});
      req.student = await user.getStudent();
      // Respond with authentication error if there is no student with that id.
      if (req.student === null) return res.sendStatus(401);

      // Continue to the next middleware function.
      next();
    });
  }
}

module.exports = {
  authorizeUserType,
};
