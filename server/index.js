const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');


const sequelize = require('./database');

const authConfig = require('./auth-config');
authConfig(passport, sequelize);

const port = 21487;
const app = express();
app.use(express.json());

app.post('/register', async (req, res) => {
  // Check if there is already a user with that username.
  const userExists = (await sequelize.models.User.findAll({
    where: {
      username: req.body.username,
    },
  })).length > 0;
  if (userExists) {
    return res.sendStatus(409);
  }

  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    // Try to add the user to the database
    await sequelize.models.User.create({
      username: req.body.username,
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      password: passwordHash,
    });
  } catch (e) {
    console.error(e);
    return res.sendStatus(400);
  }
  res.sendStatus(200);
});

app.post('/login', async (req, res, next) => {
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

        const body = {id: user.id, username: user.username};
        const token = jwt.sign({user: body}, 'SECRET_KEY');
        return res.json({token});
      });
    } catch (e) {
      return next(error);
    }
  })(req, res, next);
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
