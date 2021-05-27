const {DataTypes} = require('sequelize');

module.exports.define = (sequelize) => {
  sequelize.define('File', {
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
};

module.exports.addAssociations = ({models}) => {
  models.Teacher.hasMany(models.File);
  models.File.belongsTo(models.Teacher);

  models.Student.hasMany(models.File);
  models.File.belongsTo(models.Student);
};
