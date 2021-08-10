const express = require('express');
const fs = require('fs');
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
    fileEntry.setTeacher(req.teacher);
    fileEntry.setStudent(student);

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
        studentId: (await file.getStudent()).id,
      };
    }));
    return res.json(response);
  });

  const deleteMiddlewares = [
    authorizeUserType('teacher', sequelize),
    body('fileId').isInt(),
  ];
  router.delete('/', deleteMiddlewares, async (req, res) => {
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
    const allowedUserId = (await (await fileEntry.getTeacher()).getUser()).id;
    if (req.user.id !== allowedUserId) {
      return res.sendStatus(401);
    }
    // Delete the file from disk and the entry from the database.
    fs.unlinkSync(fileEntry.filePath);
    await fileEntry.destroy();
    return res.sendStatus(200);
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
