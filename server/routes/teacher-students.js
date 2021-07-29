const express = require('express');
const {body, validationResult} = require('express-validator');
const {authorizeUserType} = require('./utils');

function initialize(sequelize) {
  const router = new express.Router();
  // All routes require the user to be a teacher.
  router.use(authorizeUserType('teacher', sequelize));

  // Add student
  router.post('/', body('studentId').isInt(), async (req, res) => {
    // Return validation errors if any were found.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array});
    }

    // Find student specified in request.
    const student = await sequelize.models.Student.findOne({
      where: {id: req.body.studentId}});
    if (student === null) return res.sendStatus(400);

    await req.teacher.addStudent(student);
    return res.sendStatus(200);
  });

  // Route for deleting students
  router.delete('/', body('studentId').isInt(), async (req, res) => {
    // Return validation errors if any were found.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array});
    }

    // Find student specified in request.
    const student = await sequelize.models.Student.findOne({
      where: {id: req.body.studentId}});
    if (student === null) return res.sendStatus(400);

    await req.teacher.removeStudent(student);
    return res.sendStatus(200);
  });

  router.get('/', async (req, res) => {
    // Find all the teacher's students.
    const students = await req.teacher.getStudents();
    // Format the response.
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
