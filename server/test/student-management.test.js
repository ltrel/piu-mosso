const request = require('supertest');
const assert = require('assert');
const jwt = require('jsonwebtoken');

const {server, sequelize, config} = require('./_setup.test');

describe('Student Management', function() {
  let token;
  let studentToken;
  let teacher;
  let studentUsers;
  before(async function() {
    // Add a teacher.
    const teacherUser = await sequelize.models.User.create({
      username: 'teacher',
      fullName: 'Test Teacher',
      password: 'pass',
    });
    teacher = await teacherUser.createTeacher({});

    // Create a token for the teacher.
    const expiryDate = Date.now() + 10_000;
    const body = {id: teacherUser.id, username: teacherUser.username};
    token = jwt.sign(
        {expiryDate: expiryDate, user: body}, config.jwtSecret);

    // Add some students.
    studentUsers = await sequelize.models.User.bulkCreate([
      {
        username: 'student1',
        fullName: 'Student One',
        password: 'pass',
      },
      {
        username: 'student2',
        fullName: 'Student Two',
        password: 'pass',
      },
    ]);
    for (const student of studentUsers) {
      await student.createStudent({});
    }
    // Create a token from one of the students.
    const invalidTokenBody = {
      id: studentUsers[0].id,
      username: studentUsers[0].username,
    };
    studentToken = jwt.sign(
        {expiryDate: expiryDate, user: invalidTokenBody}, config.jwtSecret);
  });
  beforeEach(async function() {
    await sequelize.models.TeacherStudents.destroy({truncate: true});
  });

  describe('POST /teacher-students', function() {
    it('Adds students to teachers', async function() {
      // Get student IDs.
      const studentIds = await Promise.all(
          studentUsers.map(async (studentUser) => {
            return (await studentUser.getStudent()).id;
          }));
      // Sort them.
      studentIds.sort();
      // Send a request to add each student to the teacher.
      for (const studentId of studentIds) {
        await request(await server)
            .post('/teacher-students')
            .query({auth_token: token})
            .send({
              studentId: studentId,
            })
            .expect(200);
      }
      // Get the student IDs that have been added to the teacher.
      const addedStudentIds = await Promise.all(
          (await teacher.getStudents()).map(async (student) => {
            return student.id;
          }));
      addedStudentIds.sort();
      // Check if the two arrays of IDs are the same.
      assert.deepStrictEqual(addedStudentIds, studentIds);
    });
    it('Rejects requests with non-existent student IDs', async function() {
      await request(await server)
          .post('/teacher-students')
          .query({auth_token: token})
          .send({
            studentId: 0,
          })
          .expect(400);
    });
    it('Rejects incomplete requests', async function() {
      await request(await server)
          .post('/teacher-students')
          .query({auth_token: token})
          .send({})
          .expect(400);
    });
    it('Rejects requests from students', async function() {
      const studentId = (await studentUsers[0].getStudent()).id;
      const res = await request(await server)
          .post('/teacher-students')
          .query({auth_token: studentToken})
          .send({
            studentId: studentId,
          })
          .expect(401);
      assert.deepStrictEqual(res.body, {});
    });
  });

  describe('GET /teacher-students', function() {
    it('Lists the students', async function() {
      // Add students to the database.
      for (const studentUser of studentUsers) {
        await teacher.addStudent(await studentUser.getStudent());
      }
      // Make the request.
      const res = await request(await server)
          .get('/teacher-students')
          .query({auth_token: token})
          .expect(200);
      // Make sure the student details returned by the request are correct.
      for (const studentJson of res.body) {
        const student = await sequelize.models.Student.findOne({where: {
          id: studentJson.studentId,
        }});
        const studentUser = await student.getUser();
        assert(student);
        assert(studentUser);
        assert.strictEqual(studentUser.username, studentJson.username);
        assert.strictEqual(studentUser.fullName, studentJson.fullName);
      }
    });
    it('Rejects requests from students', async function() {
      const res = await request(await server)
          .get('/teacher-students')
          .query({auth_token: studentToken})
          .expect(401);
      assert.deepStrictEqual(res.body, {});
    });
  });

  after(async function() {
    await sequelize.models.TeacherStudents.destroy({truncate: true});
    await sequelize.models.User.destroy({truncate: true});
    await sequelize.models.Student.destroy({truncate: true});
    await sequelize.models.Teacher.destroy({truncate: true});
  });
});

