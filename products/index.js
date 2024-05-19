const express = require("express");
require("express-async-errors");
const Sequelize = require("sequelize");
const { v4: uuidv4 } = require("uuid");

const sequelize = require("./database");
const isAuth = require("./isAuth.middleware");
const Product = require("./product.model");
const {
  initRabbitMQ,
  sendToQueue,
  getConsumedData,
  getChannel,
  closeRabbitMQ,
} = require("./rabbitmq");

const ORDER_QUEUE = process.env.ORDER_QUEUE || "ORDER";
const PORT = process.env.PORT || 3002;

const app = express();
app.use(express.json());

app.get("/products", async (req, res) => {
  const results = await Product.findAll();
  res.json(results);
});

app.post("/products", isAuth, async (req, res) => {
  const { name, price, description, imageURL } = req.body;

  const product = await Product.create({
    name,
    price,
    description,
    imageURL,
    creator: req.user.email,
  });

  res.status(201).json(product);
});

app.post("/products/buy", isAuth, async (req, res) => {
  const { productIds } = req.body;

  const products = await Product.findAll({
    where: {
      id: {
        [Sequelize.Op.in]: productIds,
      },
    },
  });

  const channel = getChannel();
  const correlationId = uuidv4();
  const replyQueue = await channel.assertQueue("", { exclusive: true });

  sendToQueue(
    ORDER_QUEUE,
    { products, userEmail: req.user.email },
    { correlationId, replyTo: replyQueue.queue }
  );
  const order = await getConsumedData(
    replyQueue.queue,
    (msg) => {
      if (msg !== null && msg.properties.correlationId === correlationId) {
        return JSON.parse(msg.content.toString());
      }
      return null;
    },
    {
      noAck: true,
    }
  );

  res.json(order || {});
});

const startServer = async () => {
  try {
    await sequelize.sync();
    await initRabbitMQ(ORDER_QUEUE);

    app.listen(PORT, () =>
      console.log(`products service: Server is running on port ${PORT}`)
    );

    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      await sequelize.close();
      await closeRabbitMQ();

      server.close((err) => {
        if (err) {
          console.error("Error closing server:", err);
          process.exit(1);
        }

        console.log("Server closed");
        process.exit(0);
      });
    };

    process.once("SIGINT", gracefulShutdown);
    process.once("SIGTERM", gracefulShutdown);
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();
