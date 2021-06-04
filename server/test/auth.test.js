const request = require('supertest');
const {server, sequelize} = require('../');

describe('Authentication', function() {
  beforeEach(async function() {
    await sequelize.models.User.destroy({truncate: true});
    await sequelize.models.Student.destroy({truncate: true});
    await sequelize.models.Teacher.destroy({truncate: true});
  });

  describe('POST /register', function() {
    it('Creates users', async function() {
      await request(await server)
          .post('/register')
          .send({
            username: 'student',
            password: 'pass',
            fullName: 'Test Student',
            type: 'student',
          })
          .expect(201);
      await request(await server)
          .post('/register')
          .send({
            username: 'teacher',
            password: 'pass',
            fullName: 'Test Teacher',
            type: 'teacher',
          })
          .expect(201);
    });
    it('Rejects duplicate usernames', async function() {
      await request(await server)
          .post('/register')
          .send({
            username: 'student',
            password: 'pass',
            fullName: 'Test Student',
            type: 'student',
          })
          .expect(201);
      await request(await server)
          .post('/register')
          .send({
            username: 'student',
            password: 'pass',
            fullName: 'Other Test Student',
            type: 'student',
          })
          .expect(409);
    });
    it('Rejects incomplete requests', async function() {
      await request(await server)
          .post('/register')
          .send({
            username: 'incomplete',
          })
          .expect(400);
    });
    it('Rejects invalid account types', async function() {
      await request(await server)
          .post('/register')
          .send({
            username: 'invalid',
            password: 'pass',
            fullName: 'Invalid Type',
            type: 'invalid',
          })
          .expect(400);
    });
  });

  after(async function() {
    await (await server).close();
  });
});
