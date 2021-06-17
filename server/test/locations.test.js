const request = require('supertest');
const assert = require('assert');

const {server, sequelize, utils} = require('./_setup.test');

describe('Location Management', function() {
  let token;
  let studentToken;
  let teacher;
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
    await sequelize.models.Location.destroy({truncate: true});
  });

  describe('GET /locations', function() {
    it('Lists the locations a teacher has', async function() {
      await teacher.createLocation({
        location: 'School',
      });
      const res = await request(await server)
          .get('/locations')
          .query({auth_token: token})
          .expect('Content-Type', /json/)
          .expect(200);
      for (const locationJSON of res.body) {
        const location = await sequelize.models.Location.findOne({where: {
          id: locationJSON.locationId,
        }});
        assert.strictEqual(locationJSON.locationName, location.location);
      }
    });
    it('Rejects requests from students', async function() {
      const res = await request(await server)
          .get('/locations')
          .query({auth_token: studentToken})
          .expect(401);
      assert.deepStrictEqual(res.body, {});
    });
  });

  describe('POST /locations', function() {
    it('Adds locations to teachers', async function() {
      const res = await request(await server)
          .post('/locations')
          .query({auth_token: token})
          .send({locationName: 'School'})
          .expect('Content-Type', /json/)
          .expect(201);
      const location = await sequelize.models.Location.findOne({where: {
        id: res.body.locationId,
      }});
      assert(location);
      assert.strictEqual(location.location, 'School');
    });
    it('Rejects requests from students', async function() {
      const res = await request(await server)
          .post('/locations')
          .query({auth_token: studentToken})
          .expect(401);
      assert.deepStrictEqual(res.body, {});
    });
  });

  after(async function() {
    await utils.clearAllTables(sequelize);
  });
});
