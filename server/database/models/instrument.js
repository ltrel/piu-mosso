const {DataTypes} = require('sequelize');

module.exports.define = (sequelize) => {
  sequelize.define('Instrument', {
    instrument: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};

module.exports.addAssociations = (sequelize) => {};
