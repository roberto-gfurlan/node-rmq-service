import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  products: [{
    product_id: String
  }],
  total: {
    type: Number,
    required: true
  },
},
  { timestamps: true }
);

export default mongoose.model('Order', OrderSchema);


