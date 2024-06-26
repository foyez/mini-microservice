const { DataTypes } = require("sequelize");
const sequelize = require("./database");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  products: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  creator: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Order;
