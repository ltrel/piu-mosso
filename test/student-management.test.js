const request = require('supertest');
const assert = require('assert');

const {server, sequelize, utils} = require('./_setup.test');

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
    token = utils.generateToken(teacherUser, 10_000);

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
    studentToken = utils.generateToken(studentUsers[0], 10_000);
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
          .expect('Content-Type', /json/)
          .expect(200);
      // Make sure the student details returned by the request are correct.
      await utils.verifyStudentJsonArr(res.body, sequelize);
    });
  });

  describe('GET /students', function() {
    it('Returns a list of all student accounts', async function() {
      const res = await request(await server)
          .get('/students')
          .query({auth_token: token})
          .expect(200);

      // Make sure the student details returned by the request are correct.
      await utils.verifyStudentJsonArr(res.body, sequelize);
    });
    it('Rejects requests from students', async function() {
      const res = await request(await server)
          .get('/students')
          .query({auth_token: studentToken})
          .expect(401);
      assert.deepStrictEqual(res.body, {});
    });
  });

  after(async function() {
    await utils.clearAllTables(sequelize);
  });
});
