const {Sequelize} = require('sequelize');
const path = require('path');
const config = require('../config.json');

// Setup database connection.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, config.dbName),
  logging: (config.printQueries ? console.log : false),
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

// Syncs the database and populates it with some default entries.
async function finishDBSetup() {
  await sequelize.sync();
  await require('./default-entries').add(sequelize);
}

module.exports = {
  sequelize,
  finishDBSetup,
};
