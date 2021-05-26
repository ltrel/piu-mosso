const {DataTypes} = require('sequelize');

module.exports.define = (sequelize) => {
  sequelize.define('User', {
    userName: {
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

module.exports.addAssociations = (sequelize) => {
  sequelize.models.User.hasMany(sequelize.models.Instrument);
  sequelize.models.Instrument.belongsTo(sequelize.models.User);
}
