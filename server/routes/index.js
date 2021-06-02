const express = require('express');

function initialize(sequelize, passport) {
  const mainRouter = new express.Router();
  const secureRouter = new express.Router();

  mainRouter.use('/', require('./auth')(sequelize, passport));

  secureRouter.use(passport.authenticate('jwt', {session: false}));
  secureRouter.use('/students', require('./students')(sequelize));
  secureRouter.use('/lessons', require('./lessons')(sequelize));

  mainRouter.use('/', secureRouter);
  // Return the created router object.
  return mainRouter;
}

module.exports = initialize;
