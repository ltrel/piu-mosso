const request = require('supertest');
const assert = require('assert');

const {server, sequelize, utils} = require('./_setup.test');

describe('Instrument Management', function() {
  let token;
  let studentToken;
  before(async function() {
    // Add a user.
    const teacherUser = await sequelize.models.User.create({
      username: 'user',
      fullName: 'User Person',
      password: 'pass',
    });
    teacher = await teacherUser.createTeacher({});

    // Create a token for the user.
    token = utils.generateToken(teacherUser, 10_000);

    // Add a student.
    const studentUser = await sequelize.models.User.create({
      username: 'teacher',
      fullName: 'Test Teacher',
      password: 'pass',
    });
    // Generate a token for the student.
    await studentUser.createStudent({});
    studentToken = utils.generateToken(studentUser, 10_000);
  });
  beforeEach(async function() {
    await sequelize.models.Instrument.destroy({truncate: true});
  });

  describe('GET /instruments', function() {
    it('Lists all the instruments in the database', async function() {
      await sequelize.models.Instrument.create({
        instrument: 'piano',
      });
      const res = await request(await server)
          .get('/instruments')
          .query({auth_token: token})
          .expect('Content-Type', /json/)
          .expect(200);
      for (const instrumentJSON of res.body) {
        const instrument = await sequelize.models.Instrument.findOne({where: {
          id: instrumentJSON.instrumentId,
        }});
        assert.strictEqual(instrumentJSON.instrumentName,
            instrument.instrument);
      }
    });
    it('Rejects requests from students', async function() {
      const res = await request(await server)
          .get('/instruments')
          .query({auth_token: studentToken})
          .expect(401);
      assert.deepStrictEqual(res.body, {});
    });
  });

  describe('POST /instruments', function() {
    it('Adds instruments to the database', async function() {
      const res = await request(await server)
          .post('/instruments')
          .query({auth_token: token})
          .send({instrumentName: 'theremin'})
          .expect('Content-Type', /json/)
          .expect(201);
      const instrument = await sequelize.models.Instrument.findOne({where: {
        id: res.body.instrumentId,
      }});
      assert(instrument);
      assert.strictEqual(instrument.instrument, 'theremin');
    });
    it('Rejects incomplete requests', async function() {
      await request(await server)
          .post('/instruments')
          .query({auth_token: token})
          .send({})
          .expect(400);
    });
    it('Rejects requests from students', async function() {
      const res = await request(await server)
          .post('/instruments')
          .query({auth_token: studentToken})
          .expect(401);
      assert.deepStrictEqual(res.body, {});
    });
  });

  after(async function() {
    await utils.clearAllTables(sequelize);
  });
});
