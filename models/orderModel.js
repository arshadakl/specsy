const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  shippingAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAddress', 
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      }
    }
  ],
  orderDate: {
    type: Date,
    default: Date.now,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  OrderStatus:{
    type:String,
    require:true
  },
  paymentMethod:{
    type:String,
    require:true
  },
  paymentStatus:{
    type:String,
    require:true
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = {
    Order
};