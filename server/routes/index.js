const express = require('express');

function initialize(sequelize, passport) {
  const router = new express.Router();

  router.use('/', require('./auth')(sequelize, passport));

  // Return the created router object.
  return router;
}

module.exports = initialize;
