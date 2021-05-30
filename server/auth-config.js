const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

/**
 * @param {Passport} passport - Passport module.
 * @param {Sequelize} sequelize - Database connection.
 */
function initialize(passport, sequelize) {
  passport.use('login',
      new LocalStrategy(
          {
            usernameField: 'username',
            passwordField: 'password',
          },
          async (username, password, done) => {
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
          },
      ),
  );
}

module.exports = initialize;
