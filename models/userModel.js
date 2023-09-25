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

const User = mongoose.model('User', userSchema);

module.exports = User;