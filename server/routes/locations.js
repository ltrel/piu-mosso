const express = require('express');
const {body, validationResult} = require('express-validator');
const {authorizeUserType} = require('./utils');

function initialize(sequelize) {
  const router = new express.Router();
  // All routes require the user to be a teacher.
  router.use(authorizeUserType('teacher', sequelize));

  const postValidators = [
    body('locationName').isString().trim(),
  ];
  router.post('/', postValidators, async (req, res) => {
    // Return validation errors if any were found.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array});
    }

    const location = await req.teacher.createLocation({
      location: req.body.locationName,
    });

    return res.status(201).json({locationId: location.id});
  });

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
