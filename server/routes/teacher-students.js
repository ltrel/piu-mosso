express = require('express');

function initialize(sequelize) {
  const router = new express.Router();

  // Add student
  router.post('/', async (req, res) => {
    // Find teacher with id from request
    const user = await sequelize.models.User.findOne({
      where: {id: req.user.id}});
    const teacher = await user.getTeacher();
    // Respond with authentication error if there is no teacher with that id.
    if (teacher === null) return res.sendStatus(401);

    // Find student specified in request.
    const student = await sequelize.models.Student.findOne({
      where: {id: req.body.studentId}});
    if (student === null) return res.sendStatus(400);

    await teacher.addStudent(student);
    return res.sendStatus(201);
  });

  return router;
}

module.exports = initialize;
