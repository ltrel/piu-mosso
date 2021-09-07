const express = require('express');
const {body, validationResult} = require('express-validator');
const {authorizeUserType} = require('./utils');

function initialize(sequelize) {
  const router = new express.Router();

  const postMiddlewares = [
    authorizeUserType('teacher', sequelize),
    body('studentId').isInt(),
  ];
  // Add student
  router.post('/', postMiddlewares, async (req, res) => {
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
  const deleteMiddlewares = [
    authorizeUserType('teacher', sequelize),
    body('studentId').isInt(),
  ];
  router.delete('/', deleteMiddlewares, async (req, res) => {
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
    // Find the user making the request.
    const user = await sequelize.models.User.findOne({
      where: {id: req.user.id}});

    // Check if the user is a student or teacher and call the relevant
    // function.
    if (req.teacher = await user.getTeacher()) {
      return teacherGet(req, res);
    } else if (req.student = await user.getStudent()) {
      return studentGet(req, res);
    } else return res.sendStatus(500);
  });

  async function teacherGet(req, res) {
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
    return res.json(response);
  }

  async function studentGet(req, res) {
    // Find all the student's teachers.
    const teachers = await req.student.getTeachers();
    // Format the response.
    const response = await Promise.all(
        teachers.map(async (teacher) => {
          const teacherUser = await teacher.getUser();
          return {
            fullName: teacherUser.fullName,
            username: teacherUser.username,
            teacherId: teacher.id,
          };
        }));
    return res.json(response);
  }

  return router;
}

module.exports = initialize;
