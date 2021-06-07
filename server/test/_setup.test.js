const {server, sequelize} = require('../');
const config = require('../config.json');

before(function() {
  // Suppress console output.
  console.log = (str) => undefined;
});

after(async function() {
  await (await server).close();
});

module.exports = {server, sequelize, config};
