const express = require('express');
const path = require('path');
const multer = require('multer');
const {authorizeUserType} = require('./utils');
const {body, validationResult} = require('express-validator');

const upload = multer({dest: path.join(__dirname, '..', 'data', 'uploads')});

function initialize(sequelize) {
  const router = new express.Router();

  const postMiddlewares = [
    authorizeUserType('teacher', sequelize),
    upload.single('file'),
    body('studentId').toInt().isInt(),
  ];
  router.post('/', postMiddlewares, async (req, res) => {
    // Return validation errors if any were found.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    // Make sure a file was included in the request.
    } else if (req.file === undefined) {
      return res.sendStatus(400);
    }
    // Find the student.
    const student = await sequelize.models.Student.findOne({
      where: {id: req.body.studentId}});
    if (student === null) return res.sendStatus(400);

    // Add an entry to the database to keep track of the file.
    const fileEntry = await sequelize.models.File.create({
      fileName: req.file.originalname,
      filePath: req.file.path,
      dateTime: Date.now(),
    });

    res.status(201);
    return res.json({fileId: fileEntry.id});
  });

  return router;
}

module.exports = initialize;
