const express = require('express');
const {authorizeUserType} = require('./utils');

function initialize(sequelize) {
  const router = new express.Router();
  // All routes require the user to be a teacher.
  router.use(authorizeUserType('teacher', sequelize));

  router.get('/', async (req, res) => {
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
