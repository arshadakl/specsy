const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Number,
        required: true
    },
    accountOpenAt:{
        type:String,
        require:true
    },
    block:{
      type:Number
    },
    address: {
        shippingAddress: {
            type: String
        },
        pincode: {
            type: Number
        },
        state: {
            type: String
        }
    },
    image: {
        type: String 
    }
});


const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model for associating the cart with a user
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product', // Reference to the Product model for associating products with the cart
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1,
                max: 5
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const userAddressSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    addresses: [
      {
        country: {
          type: String,
          required: true,
        },
        fullName: {
          type: String,
          required: true,
        },
        mobileNumber: {
          type: String,
          required: true,
        },
        pincode: {
          type: Number,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        }
      }
    ]
  });

  
  
const UserAddress = mongoose.model('UserAddress', userAddressSchema);
const Cart = mongoose.model('Cart',cartSchema)
const User = mongoose.model('User', userSchema);

module.exports = {
    User,
    Cart,
    UserAddress
};