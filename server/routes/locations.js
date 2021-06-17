const express = require('express');
const {authorizeUserType} = require('./utils');

function initialize(sequelize) {
  const router = new express.Router();
  // All routes require the user to be a teacher.
  router.use(authorizeUserType('teacher', sequelize));

  router.get('/', async (req, res) => {
    // Get all of the teacher's locations.
    const locations = await req.teacher.getLocations();
    // Format the response.
    const response = await Promise.all(
        locations.map(async (location) => {
          return {
            locationName: location.location,
            locationId: location.id,
          };
        }));
    res.json(response);
  });

  return router;
}

module.exports = initialize;