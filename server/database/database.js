const {Sequelize} = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'db.sqlite'),
  // Disable for production use.
  logging: console.log,
});

const modelDefinitions = [
  require('./models/user'),
  require('./models/instrument'),
];

for (const modelDefinition of modelDefinitions) {
  modelDefinition.define(sequelize);
}
for (const modelDefinition of modelDefinitions) {
  modelDefinition.addAssociations(sequelize);
}
sequelize.sync();

module.exports = {
  sequelize,
};
