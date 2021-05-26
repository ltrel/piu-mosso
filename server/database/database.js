const {Sequelize} = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db.sqlite',
  // Disable for production use.
  logging: console.log,
});

const modelDefinitions = [
  require('./models/user'),
];

for (modelDefinition of modelDefinitions) {
  modelDefinition.define(sequelize);
}
sequelize.sync();

module.exports = {
  sequelize,
};
