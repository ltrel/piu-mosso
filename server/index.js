const express = require('express');
const passport = require('passport');

const sequelize = require('./database');

const port = 21487;
const app = express();
app.use(express.json());

const authConfig = require('./auth-config');
authConfig(passport, sequelize);
app.use(passport.initialize());

const routes = require('./routes')(sequelize, passport);

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
