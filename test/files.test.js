const request = require('supertest');
const path = require('path');
const fs = require('fs-extra');
const assert = require('assert');

const {server, sequelize, utils} = require('./_setup.test');

const uploadsDir = path.join(__dirname, '..', 'data', 'uploads');

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

    // Create uploads directory if needed.
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
  });
  beforeEach(async function() {
    // Clear the table and uploads directory.
    await sequelize.models.File.destroy({truncate: true});
    // if (fs.existsSync(uploadsDir)) {
    //   fs.emptyDirSync(uploadsDir);
    // }
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

  describe('GET /files', function() {
    it('Lists the lessons a teacher or student has', async function() {
      const fileEntries = [];
      fileEntries.push(await sequelize.models.File.create({
        fileName: 'SomeFile.mp3',
        filePath: '/some/path/to/a/file',
        dateTime: 1623810600000,
      }));
      await fileEntries[0].setTeacher(teacher);
      await fileEntries[0].setStudent(await studentUsers[0].getStudent());

      fileEntries.push(await sequelize.models.File.create({
        fileName: 'SomeOtherFile.pdf',
        filePath: '/some/path/to/a/different/file',
        dateTime: 1623810600000,
      }));
      await fileEntries[1].setTeacher(teacher);
      await fileEntries[1].setStudent(await studentUsers[1].getStudent());

      const teacherRes = await request(await server)
          .get('/files')
          .query({auth_token: token})
          .expect(200)
          .expect('Content-Type', /json/);
      assert.strictEqual(teacherRes.body.length, 2);
      utils.verifyFileJsonArr(teacherRes.body);

      const studentRes = await request(await server)
          .get('/files')
          .query({auth_token: studentToken})
          .expect(200)
          .expect('Content-Type', /json/);
      assert.strictEqual(studentRes.body.length, 1);
      utils.verifyFileJsonArr(studentRes.body);
    });
  });

  describe('GET /files/download', function() {
    it('Downloads files from the server', async function() {
      // Copy a file to the uploads directory.
      fs.copyFileSync(
          path.join(__dirname, 'bach.pdf'),
          path.join(uploadsDir, 'bach.pdf'));
      // Add database entry for the file.
      const fileEntry = await sequelize.models.File.create({
        fileName: 'bach.pdf',
        filePath: path.join(uploadsDir, 'bach.pdf'),
        dateTime: Date.now(),
      });
      fileEntry.setTeacher(teacher);
      fileEntry.setStudent(await studentUsers[0].getStudent());

      // Request to download the file.
      const teacherRes = await request(await server)
          .get('/files/download')
          .query({auth_token: token})
          .send({fileId: fileEntry.id})
          .expect(200);
      const studentRes = await request(await server)
          .get('/files/download')
          .query({auth_token: token})
          .send({fileId: fileEntry.id})
          .expect(200);

      // Compare the responses with the original file.
      const originalBuffer = fs.readFileSync(
          path.join(__dirname, 'bach.pdf'));
      assert(teacherRes.body.equals(originalBuffer));
      assert(studentRes.body.equals(originalBuffer));
    });
    it('Rejects requests from users without access', async function() {
      // Copy a file to the uploads directory.
      fs.copyFileSync(
          path.join(__dirname, 'bach.pdf'),
          path.join(uploadsDir, 'bach.pdf'));
      // Add database entry for the file.
      const fileEntry = await sequelize.models.File.create({
        fileName: 'bach.pdf',
        filePath: path.join(uploadsDir, 'bach.pdf'),
        dateTime: Date.now(),
      });
      fileEntry.setTeacher(teacher);
      fileEntry.setStudent(await studentUsers[1].getStudent());

      const res = await request(await server)
          .get('/files/download')
          .query({auth_token: studentToken})
          .send({fileId: fileEntry.id})
          .expect(401);
      assert.deepStrictEqual(res.body, {});
    });
    it('Requires requests to include a fileId', async function() {
      await request(await server)
          .get('/files/download')
          .query({auth_token: token})
          .expect(400);
    });
    it('Rejects nonexistent fileIds', async function() {
      const res = await request(await server)
          .get('/files/download')
          .query({auth_token: token})
          .send({fileId: 0})
          .expect(400);
      assert.deepStrictEqual(res.body, {});
    });
  });

  after(async function() {
    await utils.clearAllTables(sequelize);
  });
});
