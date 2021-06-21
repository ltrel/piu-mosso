const assert = require('assert');
const jwt = require('jsonwebtoken');
const config = require('../config.json');
const defaultEntries = require('../database/default-entries');

async function clearAllTables(sequelize) {
  await sequelize.models.File.destroy({truncate: true});
  await sequelize.models.Instrument.destroy({truncate: true});
  await sequelize.models.Lesson.destroy({truncate: true});
  await sequelize.models.Location.destroy({truncate: true});
  await sequelize.models.Student.destroy({truncate: true});
  await sequelize.models.TeacherStudents.destroy({truncate: true});
  await sequelize.models.Teacher.destroy({truncate: true});
  await sequelize.models.User.destroy({truncate: true});
  await defaultEntries.add(sequelize);
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

async function verifyLessonJsonArr(jsonArr, sequelize) {
  for (json of jsonArr) {
    await verifyLessonJson(json, sequelize);
  }
}
async function verifyLessonJson(json, sequelize) {
  const lesson = await sequelize.models.Lesson.findOne({where: {
    id: json.id,
  }});
  const student = await sequelize.models.Student.findOne({where: {
    id: json.studentId,
  }});
  const studentUser = await student.getUser();
  const teacher = await sequelize.models.Student.findOne({where: {
    id: json.studentId,
  }});
  const teacherUser = await teacher.getUser();
  assert(lesson);
  assert(student);
  assert(studentUser);
  assert(teacher);
  assert(teacherUser);
  assert.strictEqual(lesson.minutes, json.minutes);
  assert.strictEqual(lesson.dateTime, json.dateTime);
  assert.strictEqual(
      (await lesson.getInstrument()).instrument, json.instrument);
  assert.strictEqual(studentUser.fullName, json.studentName);
  assert.strictEqual(teacherUser.fullName, json.teacherName);
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
  verifyLessonJson,
  verifyLessonJsonArr,
  generateToken,
};
