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
  models.User.hasMany(models.Instrument);
  models.Instrument.belongsTo(models.User);
};
