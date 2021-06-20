const express = require('express');
const {body, validationResult} = require('express-validator');
const {authorizeUserType} = require('./utils');

function initialize(sequelize) {
  const router = new express.Router();

  const postValidators = [
    authorizeUserType('teacher', sequelize),
    body('studentId').isInt(),
    body('instrument').isString().trim(),
    body('location').isString().trim(),
    body('dateTime').isInt(),
    body('minutes').isInt(),
  ];
  router.post('/', postValidators, async (req, res) => {
    // Return validation errors if any were found.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array});
    }

    // Find student specified in request.
    const student = await sequelize.models.Student.findOne({
      where: {id: req.body.studentId}});
    if (student === null) return res.sendStatus(400);

    // Find instrument specified in request.
    const instrument = await sequelize.models.Instrument.findOne({
      where: {instrument: req.body.instrument}});
    if (instrument === null) return res.sendStatus(400);

    // Find location specified in request.
    const location = await sequelize.models.Location.findOne({
      where: {location: req.body.location}});
    if (location === null) return res.sendStatus(400);

    // Create the lesson.
    const lesson = await req.teacher.createLesson({
      dateTime: req.body.dateTime,
      minutes: req.body.minutes,
    });
    lesson.setTeacher(req.teacher);
    lesson.setStudent(student);
    lesson.setInstrument(instrument);
    lesson.setLocation(location);

    return res.status(201).send({lessonId: lesson.id});
  });

  router.get('/', async (req, res) => {
    const user = await sequelize.models.User.findOne({
      where: {id: req.user.id}});

    // Check if the user is a teacher or student,
    // then find all the lessons they are involved in.
    let lessons;
    if (teacher = await user.getTeacher()) {
      lessons = await teacher.getLessons();
    } else if (student = await user.getStudent()) {
      lessons = await student.getLessons();
    } else return res.sendStatus(500);

    // Format the lesson details into something useful.
    const response = await Promise.all(lessons.map(async (lesson) => {
      const teacherName = (await (await lesson.getTeacher())
          .getUser()).fullName;
      const studentName = (await (await lesson.getStudent())
          .getUser()).fullName;
      return {
        id: lesson.id,
        dateTime: lesson.dateTime.getTime(),
        minutes: lesson.minutes,
        notes: lesson.notes,
        teacherName: teacherName,
        teacherId: (await lesson.getTeacher()).id,
        studentName: studentName,
        studentId: (await lesson.getTeacher()).id,
        instrument: (await lesson.getInstrument()).instrument,
      };
    }));
    return res.json(response);
  });
  return router;
}

module.exports = initialize;
