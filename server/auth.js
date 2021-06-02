const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const config = require('./config.json');

function initialize(passport, sequelize) {
  async function verifyLogin(username, password, done) {
    try {
      // Search for the user in the database
      const user = await sequelize.models.User.findOne({
        where: {
          username: username,
        },
      });
      // Make sure the user exists.
      if (!user) {
        return done(null, false, {message: 'User not found'});
      }

      // Check the password.
      const validPass = await bcrypt.compare(password, user.password);
      if (!validPass) {
        return done(null, false, {message: 'Password incorrect'});
      }

      return done(null, user, {message: 'Success'});
    } catch (e) {
      // Something went wrong.
      return done(e);
    }
  }

  passport.use('login',
      new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
      },
      verifyLogin,
      ),
  );

  passport.use('jwt',
      new JWTStrategy({
        secretOrKey: config.jwtSecret,
        jwtFromRequest: ExtractJWT.fromUrlQueryParameter('auth_token'),
      },
      async (token, done) => {
        try {
          if (Date.now() > token.expiryDate) {
            return done(null, false, {message: 'Token expired'});
          }
          return done(null, token.user);
        } catch (e) {
          done(e);
        }
      },
      ),
  );
}

module.exports = initialize;
