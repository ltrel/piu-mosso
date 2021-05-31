const express = require('express');

function initialize(sequelize, passport) {
  const router = new express.Router();

  router.use('/', require('./auth')(sequelize, passport));

  router.use('/user/students', passport.authenticate('jwt', {session: false}),
      require('./students')(sequelize));

  // Return the created router object.
  return router;
}

module.exports = initialize;
