const {DataTypes} = require('sequelize');

module.exports.define = (sequelize) => {
  sequelize.define('Lesson', {
    dateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  });
};

module.exports.addAssociations = ({models}) => {
  models.Teacher.hasMany(models.Lesson);
  models.Lesson.belongsTo(models.Teacher);

  models.Student.hasMany(models.Lesson);
  models.Lesson.belongsTo(models.Student);

  models.Location.hasMany(models.Lesson);
  models.Lesson.belongsTo(models.Location);

  models.Instrument.hasMany(models.Lesson);
  models.Lesson.belongsTo(models.Instrument);
};
