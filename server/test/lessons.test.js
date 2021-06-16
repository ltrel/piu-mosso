const request = require('supertest');
const assert = require('assert');

const {server, sequelize, utils} = require('./_setup.test');

describe('Lesson Scheduling', function() {
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
      await teacher.addStudent(await student.getStudent());
    }
    // Create a token from one of the students.
    studentToken = utils.generateToken(studentUsers[0], 10_000);
  });
  beforeEach(async function() {
    await sequelize.models.Lesson.destroy({truncate: true});
  });

  describe('POST /lessons', function() {
    it('Creates lessons', async function() {
      const res = await request(await server)
          .post('/lessons')
          .query({auth_token: token})
          .send({
            studentId: (await studentUsers[0].getStudent()).id,
            instrument: 'piano',
            // One hour from now.
            dateTime: Date.now() + 3_600_000,
            minutes: 30,
          })
          .expect('Content-Type', /json/)
          .expect(201);
      const createdLesson = await sequelize.models.Lesson.findOne({
        where: {id: res.body.lessonId},
      });
      assert(createdLesson);
    });
    it('Rejects nonexistent student IDs', async function() {
      await request(await server)
          .post('/lessons')
          .query({auth_token: token})
          .send({
            studentId: 0,
            instrument: 'violin',
            dateTime: Date.now() + 7_200_000,
            minutes: 45,
          })
          .expect(400);
      assert.strictEqual(await sequelize.models.Lesson.count(), 0);
    });
    it('Rejects requests from students', async function() {
      const res = await request(await server)
          .post('/lessons')
          .query({auth_token: studentToken})
          .expect(401);
      assert.deepStrictEqual(res.body, {});
    });
    it('Rejects incomplete requests', async function() {
      await request(await server)
          .post('/lessons')
          .query({auth_token: token})
          .send({})
          .expect(400);
    });
    it('Rejects instruments not in database', async function() {
      await request(await server)
          .post('/lessons')
          .query({auth_token: token})
          .send({
            studentId: (await studentUsers[0].getStudent()).id,
            instrument: 'thisisnotaninstrument',
            dateTime: Date.now() + 3_600_000,
            minutes: 60,
          })
          .expect(400);
      assert.strictEqual(await sequelize.models.Lesson.count(), 0);
    });
  });

  describe('GET /lessons', function() {
    it('Lists the lessons a teacher has', async function() {
      const saxophone = await sequelize.models.Instrument.findOne({
        where: {instrument: 'saxophone'},
      });
      const clarinet = await sequelize.models.Instrument.findOne({
        where: {instrument: 'clarinet'},
      });

      const lessons = [];
      lessons.push(await sequelize.models.Lesson.create({
        dateTime: 1623810600000,
        minutes: 30,
      }));
      await lessons[0].setTeacher(teacher);
      await lessons[0].setStudent(await studentUsers[0].getStudent());
      await lessons[0].setInstrument(saxophone);

      lessons.push(await sequelize.models.Lesson.create({
        dateTime: 1623769200000,
        minutes: 45,
      }));
      await lessons[1].setTeacher(teacher);
      await lessons[1].setStudent(await studentUsers[1].getStudent());
      await lessons[1].setInstrument(clarinet);

      const teacherRes = await request(await server)
          .get('/lessons')
          .query({auth_token: token})
          .expect(200)
          .expect('Content-Type', /json/);
      assert.strictEqual(teacherRes.body.length, 2);
      utils.verifyLessonJsonArr(teacherRes.body);

      const studentRes = await request(await server)
          .get('/lessons')
          .query({auth_token: studentToken})
          .expect(200)
          .expect('Content-Type', /json/);
      assert.strictEqual(studentRes.body.length, 1);
      utils.verifyLessonJsonArr(studentRes.body);
    });
  });

  after(async function() {
    await utils.clearAllTables(sequelize);
  });
});
