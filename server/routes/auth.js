const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {body, validationResult} = require('express-validator');

const config = require('../config.json');

function initialize(sequelize, passport) {
  const router = new express.Router();

  const registerValidators = [
    body('username').isString(),
    body('password').isString(),
    body('type').isIn(['student', 'teacher']),
  ];
  router.post('/register', registerValidators, async (req, res) => {
    // Return validation errors if any were found.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array});
    }

    // Check if there is already a user with that username.
    const userExists = (await sequelize.models.User.findAll({
      where: {
        username: req.body.username,
      },
    })).length > 0;
    if (userExists) return res.sendStatus(409);

    try {
      // Hash the password
      const passwordHash = await bcrypt.hash(req.body.password,
          config.saltRounds);
      // Try to add the user to the database
      const newUser = await sequelize.models.User.create({
        username: req.body.username,
        fullName: req.body.fullName,
        password: passwordHash,
      });

      // Set the type of user
      if (req.body.type === 'student') {
        await newUser.createStudent({});
      } else if (req.body.type === 'teacher') {
        await newUser.createTeacher({});
      }
    } catch (e) {
      console.error(e);
      return res.sendStatus(400);
    }
    res.sendStatus(201);
  });

  router.post('/login', async (req, res, next) => {
    // Pass result of authentication attempt into callback.
    passport.authenticate('login', async (err, user, info) => {
      try {
        if (err) {
          const error = new Error('An error occurred');
          return next(error);
        } else if (!user) {
          return res.sendStatus(401);
        }

        req.login(user, {session: false}, async (error) => {
          if (error) return next(error);

          const expiryDate = Date.now() + config.jwtExpirySeconds * 1000;
          const body = {id: user.id, username: user.username};
          const token = jwt.sign(
              {expiryDate: expiryDate, user: body}, config.jwtSecret);
          return res.json({token});
        });
      } catch (e) {
        return next(error);
      }
    })(req, res, next);
  });

  router.get('/verify-token',
      passport.authenticate('jwt', {session: false}), (req, res) => {
        // Respond with the user's details if authentication was succesful.
        res.json(req.user);
      });

  return router;
}

module.exports = initialize;
