import express from 'express'
const app = express()
const PORT = process.env.PORT || 3001
const mongoose = require('mongoose')
const productRouter = require('./routes/product.js')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/products', productRouter)

mongoose
  .connect('mongodb://localhost:27017/scan-product-service', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((err) => {
    console.log(err)
  })

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
