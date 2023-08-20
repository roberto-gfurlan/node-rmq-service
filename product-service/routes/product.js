import ampq from 'amqplib'
import Router from 'express'
import Product from '../models/product.js'

const router = new Router()

let order, channel, connection

//Connect to RabbitMQ
async function connectToRabbitMQ() {
  const amqpServer = 'amqp://localhost:5672'
  connection = await ampq.connect(amqpServer)
  channel = await connection.createChannel()
  await channel.assertQueue('product-service-queue')
}
connectToRabbitMQ

//Create a new product
router.post('/', async (req, res) => {
  const { name, description, price } = req.body
  if (!name || !description || !price) {
    res.status(400).json({ message: 'Missing fields' })
  }
  const product = await new Product({ ...req.body })
  await product.save()
  return res.status(201).json({
    message: 'Product created successfully',
    product,
  })
})

//Buy product
router.post('/buy', async (req, res) => {
  const { productId } = req.body
  const product = await Product.find({ _id: { $in: productId } })

  //send order to rabbitMQ
  channel.sendToQueue('product-service-queue', Buffer.from(JSON.stringify(product)))

  // Consume previously placed order from RabbitMQ & acknowledge the transaction
  channel.consume('product-service-queue', (data) => {
    console.log('Consumed product from queue')
    order = JSON.parse(data.content)
    channel.ack(data)
  })
  return res.send(201).json({
    message: 'Order placed successfully',
    order,
  })
})

module.exports = router
