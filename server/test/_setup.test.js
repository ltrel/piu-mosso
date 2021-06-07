const {server, sequelize} = require('../');
const config = require('../config.json');

before(async function() {
  await server;
  // Suppress console output.
  console.log = (str) => undefined;
});

after(async function() {
  await (await server).close();
});

module.exports = {server, sequelize, config};
