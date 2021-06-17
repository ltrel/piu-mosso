const express = require('express');

function initialize(sequelize, passport) {
  const mainRouter = new express.Router();
  const secureRouter = new express.Router();

  // Add the authentication routes.
  mainRouter.use('/', require('./auth')(sequelize, passport));

  // Add all the other routes that require the user to be logged in.
  secureRouter.use(passport.authenticate('jwt', {session: false}));
  secureRouter.use('/students', require('./students')(sequelize));
  secureRouter.use('/teacher-students',
      require('./teacher-students')(sequelize));
  secureRouter.use('/lessons', require('./lessons')(sequelize));
  secureRouter.use('/locations', require('./locations')(sequelize));

  mainRouter.use('/', secureRouter);
  // Return the created router object.
  return mainRouter;
}

module.exports = initialize;
