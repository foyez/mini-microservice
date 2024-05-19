const amqp = require("amqplib");

let connection = null;
let channel = null;

const initRabbitMQ = async (queueName, { durable } = { durable: true }) => {
  try {
    const amqpURL = process.env.AMQP_URL || "amqp://localhost";
    connection = await amqp.connect(amqpURL);
    channel = await connection.createChannel();

    // process.once("SIGINT", () => {
    //   channel.close();
    //   connection.close();
    // });

    await channel.assertQueue(queueName, { durable });
    console.log(`${queueName} service: Connected to RabbitMQ`);
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    process.exit(1);
  }
};

const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized");
  }

  return channel;
};

const DATA_CONSUMING_TIMEOUT = 5000;
const getConsumedData = (
  queueName,
  cb,
  { noAck, skipTimeout } = { noAck: false, skipTimeout: false }
) => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized");
  }

  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("Data consuming timed out"));
    }, DATA_CONSUMING_TIMEOUT);

    if (skipTimeout) {
      clearTimeout(timeoutId);
    }

    try {
      await channel.consume(
        queueName,
        (msg) => {
          clearTimeout(timeoutId);

          if (!noAck) channel.ack(msg);
          const data = cb(msg);
          resolve(data);
        },
        { noAck }
      );
    } catch (error) {
      reject(new Error("Failed to consume data:", error));
    }
  });
};

const sendToQueue = (queueName, data, options = {}) => {
  const isSent = channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify(data)),
    options
  );

  if (!isSent) {
    console.error("Failed to send data to queue");
  }
};

const closeRabbitMQ = async () => {
  try {
    if (channel) {
      await channel.close();
    }

    if (connection) {
      await connection.close();
    }
  } catch (error) {
    console.error("Failed to close RabbitMQ connection:", error);
  }
};

module.exports = {
  initRabbitMQ,
  getChannel,
  getConsumedData,
  sendToQueue,
  closeRabbitMQ,
};
