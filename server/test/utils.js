assert = require('assert');
jwt = require('jsonwebtoken');
config = require('../config.json');

async function clearAllTables(sequelize) {
  await sequelize.models.File.destroy({truncate: true});
  await sequelize.models.Instrument.destroy({truncate: true});
  await sequelize.models.Lesson.destroy({truncate: true});
  await sequelize.models.Location.destroy({truncate: true});
  await sequelize.models.Student.destroy({truncate: true});
  await sequelize.models.TeacherStudents.destroy({truncate: true});
  await sequelize.models.Teacher.destroy({truncate: true});
  await sequelize.models.UserInstruments.destroy({truncate: true});
  await sequelize.models.User.destroy({truncate: true});
}

async function verifyStudentJsonArr(jsonArr, sequelize) {
  for (json of jsonArr) {
    await verifyStudentJson(json, sequelize);
  }
}
async function verifyStudentJson(json, sequelize) {
  const student = await sequelize.models.Student.findOne({where: {
    id: json.studentId,
  }});
  const studentUser = await student.getUser();
  assert(student);
  assert(studentUser);
  assert.strictEqual(studentUser.username, json.username);
  assert.strictEqual(studentUser.fullName, json.fullName);
}

function generateToken(user, expiryOffset) {
  const expiryDate = Date.now() + expiryOffset;
  const body = {id: user.id, username: user.username};
  return jwt.sign({expiryDate: expiryDate, user: body}, config.jwtSecret);
}

module.exports = {
  clearAllTables,
  verifyStudentJson,
  verifyStudentJsonArr,
  generateToken,
};
