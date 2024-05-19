const express = require("express");
require("express-async-errors");

const Order = require("./order.model");
const sequelize = require("./database");
const {
  initRabbitMQ,
  getConsumedData,
  sendToQueue,
  closeRabbitMQ,
} = require("./rabbitmq");

const ORDER_QUEUE = process.env.ORDER_QUEUE || "ORDER";
const PORT = process.env.PORT || 3003;

const app = express();
app.use(express.json());

app.get("/orders", async (_req, res) => {
  const results = await Order.findAll();
  res.json(results);
});

const createOrder = async (products, userEmail) => {
  try {
    const total = products.reduce(
      (sum, product) => sum + parseFloat(product.price),
      0
    );
    const productIds = products.map((product) => product.id);

    const newOrder = await Order.create({
      products: productIds,
      totalPrice: total,
      creator: userEmail,
    });

    return newOrder;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

const startServer = async () => {
  try {
    await sequelize.sync();
    await initRabbitMQ(ORDER_QUEUE);

    app.listen(PORT, () =>
      console.log(`products service: Server is running on port ${PORT}`)
    );

    // Create Order
    try {
      await getConsumedData(
        ORDER_QUEUE,
        async (msg) => {
          if (msg !== null) {
            const { products, userEmail } = JSON.parse(msg.content.toString());
            const newOrder = await createOrder(products, userEmail);
            sendToQueue(
              msg.properties.replyTo,
              { newOrder },
              { correlationId: msg.properties.correlationId }
            );
          }
        },
        { noAck: false, skipTimeout: true }
      );
    } catch (error) {
      console.error("Error creating order:", error);
    }

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
