const request = require('supertest');
const jwt = require('jsonwebtoken');
const assert = require('assert');

const {server, sequelize} = require('../');
const config = require('../config.json');

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

  describe('POST /login', function() {
    it('Returns valid JWTs when given correct details', async function() {
      await request(await server)
          .post('/register')
          .send({
            username: 'testuser',
            password: 'pass',
            fullName: 'Test User',
            type: 'teacher',
          })
          .expect(201);
      const res = await request(await server)
          .post('/login')
          .send({
            username: 'testuser',
            password: 'pass',
          })
          .expect('Content-Type', /json/)
          .expect(200);
      const token = (jwt.verify(res.body.token, config.jwtSecret));
      assert.strictEqual(token.user.username, 'testuser');
    });
    it('Rejects incorrect passwords', async function() {
      await request(await server)
          .post('/register')
          .send({
            username: 'testuser',
            password: 'pass',
            fullName: 'Test User',
            type: 'teacher',
          })
          .expect(201);
      const res = await request(await server)
          .post('/login')
          .send({
            username: 'testuser',
            password: 'wrongpass',
          })
          .expect(401);
      assert.deepStrictEqual(res.body, {});
    });
  });

  describe('GET /verify-token', function() {
    it('Returns user details for valid JWTs', async function() {
      // Expires 10 seconds in the future
      const expiryDate = Date.now() + 10_000;
      const body = {id: 1, username: 'testuser'};
      const token = jwt.sign(
          {expiryDate: expiryDate, user: body}, config.jwtSecret);
      const res = await request(await server)
          .get('/verify-token')
          .query({auth_token: token})
          .expect('Content-Type', /json/)
          .expect(200);
      assert.deepStrictEqual(res.body, body);
    });
    it('Rejects expired JWTs', async function() {
      // Expired 10 seconds in the past
      const expiryDate = Date.now() - 10_000;
      const body = {id: 1, username: 'testuser'};
      const token = jwt.sign(
          {expiryDate: expiryDate, user: body}, config.jwtSecret);
      const res = await request(await server)
          .get('/verify-token')
          .query({auth_token: token})
          .expect(401);
      assert.deepStrictEqual(res.body, {});
    });
  });

  after(async function() {
    await (await server).close();
  });
});
