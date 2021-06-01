const express = require('express');
const passport = require('passport');
const fs = require('fs');
const path = require('path');

// Make sure config file exists before attempting to load it.
if (!fs.existsSync(path.join(__dirname, 'config.json'))) {
  console.error('config.json could not be found, Aborting.');
  return;
}
const config = require('./config.json');

// Database connection
const sequelize = require('./database');

// Express app
const port = config.port;
const app = express();
app.use(express.json());

// Authentication
const authConfig = require('./auth');
authConfig(passport, sequelize);
app.use(passport.initialize());

// API routes
const routes = require('./routes')(sequelize, passport);
app.use('/', routes);

// Start server once the database is ready
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
});
