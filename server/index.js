const express = require('express');
const passport = require('passport');

// Database connection
const sequelize = require('./database');

// Express app
const port = 21487;
const app = express();
app.use(express.json());

// Authentication
const authConfig = require('./auth');
authConfig(passport, sequelize);
app.use(passport.initialize());

// API routes
const routes = require('./routes')(sequelize, passport);
app.use('/', routes);

// Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
