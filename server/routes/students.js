const express = require('express');

function initialize(sequelize) {
  const router = new express.Router();

  router.get('/', async (req, res) => {
    // Find teacher with id from request
    const user = await sequelize.models.User.findOne({
      where: {id: req.user.id}});
    const teacher = await user.getTeacher();
    // Respond with authentication error if there is no teacher with that id.
    if (teacher === null) return res.sendStatus(401);

    const students = await sequelize.models.Student.findAll();
    const response = await Promise.all(
        students.map(async (student) => {
          const studentUser = await student.getUser();
          return {
            fullName: studentUser.fullName,
            username: studentUser.username,
            studentId: student.id,
          };
        }));
    res.json(response);
  });

  return router;
}

module.exports = initialize;
