const express = require('express');
const {authorizeUserType} = require('./utils');

function initialize(sequelize) {
  const router = new express.Router();
  // All routes require the user to be a teacher.
  router.use(authorizeUserType('teacher', sequelize));

  // Add student
  router.post('/', async (req, res) => {
    // Make sure request body contains a student ID.
    if (!('studentId' in req.body)) return res.sendStatus(400);

    // Find student specified in request.
    const student = await sequelize.models.Student.findOne({
      where: {id: req.body.studentId}});
    if (student === null) return res.sendStatus(400);

    await req.teacher.addStudent(student);
    return res.sendStatus(200);
  });

  router.get('/', async (req, res) => {
    const students = await req.teacher.getStudents();
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
