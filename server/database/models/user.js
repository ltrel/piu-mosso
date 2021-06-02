const {DataTypes} = require('sequelize');

module.exports.define = (sequelize) => {
  sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
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
  models.User.belongsToMany(models.Instrument, {through: 'UserInstruments'});
  models.Instrument.belongsToMany(models.User, {through: 'UserInstruments'});

  models.User.hasOne(models.Student);
  models.Student.belongsTo(models.User);

  models.User.hasOne(models.Teacher);
  models.Teacher.belongsTo(models.User);
};
