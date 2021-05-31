const {Sequelize} = require('sequelize');
const path = require('path');

// Setup database connection.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'db.sqlite'),
  // Disable for production use.
  logging: console.log,
});

// Load files containing the database schema.
const modelDefinitions = [
  require('./models/user'),
  require('./models/instrument'),
  require('./models/location'),
  require('./models/student'),
  require('./models/teacher'),
  require('./models/lesson'),
  require('./models/file'),
];

// Create the database tables if they don't already exist.
for (const model of modelDefinitions) {
  model.define(sequelize);
}
// Create the assocations between database tables.
for (const model of modelDefinitions) {
  model.addAssociations(sequelize);
}
// Save everything to disk.
sequelize.sync();

module.exports = sequelize;
