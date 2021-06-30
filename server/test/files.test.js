const request = require('supertest');
const path = require('path');
const assert = require('assert');

const {server, sequelize, utils} = require('./_setup.test');

describe('Shared Files', function() {
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
      // Add the students to the teacher.
      await teacher.addStudent(await student.getStudent());
    }
    // Create a token from one of the students.
    studentToken = utils.generateToken(studentUsers[0], 10_000);
  });
  beforeEach(async function() {
    await sequelize.models.File.destroy({truncate: true});
  });

  describe('POST /files', function() {
    it('Uploads files to the server', async function() {
      const studentId = (await studentUsers[0].getStudent()).id;
      const res = await request(await server)
          .post('/files')
          .query({auth_token: token})
          .field('studentId', studentId)
          .attach('file', path.join(__dirname, 'bach.pdf'))
          .expect('Content-Type', /json/)
          .expect(201);
      assert(res.body.fileId);
    });
    it('Requires requests to include a file', async function() {
      const studentId = (await studentUsers[0].getStudent()).id;
      const res = await request(await server)
          .post('/files')
          .query({auth_token: token})
          .field('studentId', studentId)
          .expect(400);
      assert.deepStrictEqual(res.body, {});
    });
    it('Requires requests to include a studentId', async function() {
      await request(await server)
          .post('/files')
          .query({auth_token: token})
          .attach('file', path.join(__dirname, 'bach.pdf'))
          .expect(400);
    });
    it('Rejects requests from students', async function() {
      const studentId = (await studentUsers[0].getStudent()).id;
      const res = await request(await server)
          .post('/files')
          .query({auth_token: studentToken})
          .field('studentId', studentId)
          .attach('file', path.join(__dirname, 'bach.pdf'))
          .expect(401);
      assert.deepStrictEqual(res.body, {});
    });
  });

  after(async function() {
    await utils.clearAllTables(sequelize);
  });
});
