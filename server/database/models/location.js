const {DataTypes} = require('sequelize');

module.exports.define = (sequelize) => {
  sequelize.define('Location', {
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};

module.exports.addAssociations = (sequelize) => {};
