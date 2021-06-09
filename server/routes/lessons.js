const express = require('express');

function initialize(sequelize) {
  const router = new express.Router();

  // Schedule lesson
  router.post('/', async (req, res) => {
    // Find teacher with id from request
    const user = await sequelize.models.User.findOne({
      where: {id: req.user.id}});
    const teacher = await user.getTeacher();
    // Respond with authentication error if that user isn't a teacher.
    if (teacher === null) return res.sendStatus(401);

    // Find student specified in request.
    const student = await sequelize.models.Student.findOne({
      where: {id: req.body.studentId}});
    if (student === null) return res.sendStatus(400);

    // Find instrument specified in request.
    const instrument = await sequelize.models.Instrument.findOne({
      where: {instrument: req.body.instrument}});
    if (instrument === null) return res.sendStatus(400);

    const lesson = await teacher.createLesson({
      dateTime: req.body.dateTime,
      minutes: req.body.minutes,
    });
    lesson.setTeacher(teacher);
    lesson.setStudent(student);
    lesson.setInstrument(instrument);

    return res.sendStatus(201);
  });

  // Get lessons
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
        teacher: teacherName,
        student: studentName,
        instrument: (await lesson.getInstrument()).instrument,
      };
    }));
    return res.json(response);
  });
  return router;
}

module.exports = initialize;
