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
  require('./models/location'),
  require('./models/student'),
  require('./models/teacher'),
  require('./models/lesson'),
  require('./models/file'),
];

for (const model of modelDefinitions) {
  model.define(sequelize);
}
for (const model of modelDefinitions) {
  model.addAssociations(sequelize);
}
sequelize.sync();

module.exports = sequelize;
