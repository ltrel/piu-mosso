express = require('express');

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

  return router;
}

module.exports = initialize;
