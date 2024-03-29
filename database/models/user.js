const {DataTypes} = require('sequelize');

module.exports.define = (sequelize) => {
  sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};

module.exports.addAssociations = ({models}) => {
  models.User.hasOne(models.Student);
  models.Student.belongsTo(models.User);

  models.User.hasOne(models.Teacher);
  models.Teacher.belongsTo(models.User);
};
