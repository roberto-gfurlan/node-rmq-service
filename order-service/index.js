import ampq from 'amqplib/callback_api';
import express from 'express';
import mongoose from 'mongoose';
const app = express();
const PORT = process.env.PORT || 3002;

const Order = require('./models/Order');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let channel, connection;

mongoose.connect('mongodb://localhost:27017/scan-order-service', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.log(err);
});  

// RabbitMQ connection
async function connectToRabbitMQ() {
  const ampqServer = 'amqp://localhost:5672';
  connection = await ampq.connect(ampqServer);
  channel = await connection.createChannel();
  await channel.assertQueue('order-service-queue');
}

//Create Order
const createOrder = (product) => {
  let total = 0;
  product.forEach((item) => {
    total += item.price;
  });
  const order = new Order({
    products: product,
    total: total
  });
  order.save()
  return order;
}

//Get Order
connectToRabbitMQ().then(() => {
  channel.consume('order-service-queue', data => {
    const { products } = JSON.parse(data.content);
    const newOrder = createOrder(products);
    channel.ack(data);
    channel.sendToQueue('product-service-queue', Buffer.from(JSON.stringify(newOrder)));
  });
});

app.listen(PORT, () => {
  console.log(`Order service is running on port ${PORT}`);
});
