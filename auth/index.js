const express = require("express");
require("express-async-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./user.model");
const sequelize = require("./database");

const app = express();
app.use(express.json());

const port = process.env.PORT || 3001;

app.post("/api/users/signup", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ email, password: hashedPassword });
  const payload = { email: newUser.email, id: newUser.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token, email: newUser.email });
});

app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const payload = { email: user.email, id: user.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token, email: user.email });
});

sequelize.sync().then(() => {
  app.listen(port, () =>
    console.log(`auth service: Server running on port ${port}`)
  );
});
