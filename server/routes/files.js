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

  router.get('/', async (req, res) => {
    const user = await sequelize.models.User.findOne({
      where: {id: req.user.id}});

    // Check if the user is a teacher or student,
    // then find all the files they have access to.
    let fileEntries;
    if (teacher = await user.getTeacher()) {
      fileEntries = await teacher.getFiles();
    } else if (student = await user.getStudent()) {
      fileEntries = await student.getFiles();
    } else return res.sendStatus(500);

    const response = await Promise.all(fileEntries.map(async (file) => {
      const teacherName = (await (await file.getTeacher())
          .getUser()).fullName;
      const studentName = (await (await file.getStudent())
          .getUser()).fullName;
      return {
        id: file.id,
        dateTime: file.dateTime.getTime(),
        fileName: file.fileName,
        teacherName: teacherName,
        teacherId: (await file.getTeacher()).id,
        studentName: studentName,
        studentId: (await file.getTeacher()).id,
      };
    }));
    return res.json(response);
  });

  const downloadMiddlewares = [
    body('fileId').isInt(),
  ];
  router.get('/download', downloadMiddlewares, async (req, res) => {
    // Return validation errors if any were found.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    // Find the database entry corresponding to the file.
    const fileEntry = await sequelize.models.File.findOne(
        {where: {id: req.body.fileId}});
    if (fileEntry === null) return res.sendStatus(400);

    // Make sure the user has permission to access the file.
    const allowedUserIds = [
      (await (await fileEntry.getTeacher()).getUser()).id,
      (await (await fileEntry.getStudent()).getUser()).id,
    ];
    if (!allowedUserIds.includes(req.user.id)) {
      return res.sendStatus(401);
    }

    return res.download(fileEntry.filePath, fileEntry.fileName);
  });

  return router;
}

module.exports = initialize;
