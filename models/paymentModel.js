const mongoose = require('mongoose');

const transactionHistorySchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderDetails: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
          required: true,
        },
        orderDate: {
          type: Date,
          required: true,
        },
        products: [
          {
            productId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Product',
            },
            quantity: {
              type: Number,
            },
          },
        ],
      },
    ],
    paymentMethod: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    discount: {
      discount_amount: {
        type: Number,
        required: true,
      },
      code_id: {
        type: String,
        required: true
      }
    },
    transactionDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    purpose:{
      type: String,
      required: true,
    }
  });


  const walletSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
      unique: true, 
    },
    walletId: {
      type: String,
      unique: true, 
      required: true,
    },
    balance: {
      type: Number,
      default: 0, 
      required: true,
    }
  });

const TransactionHistory = mongoose.model('TransactionHistory', transactionHistorySchema);
const Wallet = mongoose.model('Wallet', walletSchema);

module.exports ={
  TransactionHistory,
  Wallet
} 
