const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: "postgres",
  logging: false,
});

sequelize
  .authenticate()
  .then(() =>
    console.log("auth service: Connection has been established successfully.")
  )
  .catch((error) =>
    console.error("auth service: Unable to connect to the database:", error)
  );

module.exports = sequelize;
