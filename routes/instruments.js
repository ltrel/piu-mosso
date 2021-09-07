const express = require('express');
const {body, validationResult} = require('express-validator');
const {authorizeUserType} = require('./utils');

function initialize(sequelize) {
  const router = new express.Router();
  // All routes require the user to be a teacher.
  router.use(authorizeUserType('teacher', sequelize));

  const postValidators = [
    body('instrumentName').isString().trim(),
  ];
  router.post('/', postValidators, async (req, res) => {
    // Return validation errors if any were found.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array});
    }

    const instrument = await sequelize.models.Instrument.create({
      instrument: req.body.instrumentName,
    });

    return res.status(201).json({instrumentId: instrument.id});
  });

  router.get('/', async (req, res) => {
    // Get all of the user's instruments.
    const instruments = await sequelize.models.Instrument.findAll({
      where: {},
    });
    // Format the response.
    const response = await Promise.all(
        instruments.map(async (instrument) => {
          return {
            instrumentName: instrument.instrument,
            instrumentId: instrument.id,
          };
        }));
    res.json(response);
  });

  return router;
}

module.exports = initialize;
