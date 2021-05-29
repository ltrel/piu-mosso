const express = require('express');
const bcrypt = require('bcrypt');

const sequelize = require('./database');

const port = 21487;
const app = express();
app.use(express.json());

app.post('/register', async (req, res) => {
  // Check if there is already a user with that username.
  const userExists = (await sequelize.models.User.findAll({
    where: {
      userName: req.body.username,
    },
  })).length > 0;
  if (userExists) {
    res.sendStatus(409).end();
    return;
  }

  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    // Try to add the user to the database
    await sequelize.models.User.create({
      userName: req.body.username,
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      password: passwordHash,
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(400).end();
    return;
  }
  res.sendStatus(200).end();
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
