const express = require('express');
const passport = require('passport');

const sequelize = require('./database');

const authConfig = require('./auth-config');
authConfig(passport, sequelize);

const routes = require('./routes')(sequelize, passport);

const port = 21487;
const app = express();
app.use(express.json());

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
