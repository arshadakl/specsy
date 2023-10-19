const UserDB = require("../models/userModel").User;
const ProductDB = require("../models/productsModel").product;
const CartDB = require("../models/userModel").Cart;
const addressDB = require("../models/userModel").UserAddress;
const OrderDB = require("../models/orderModel").Order;
const CouponDB = require("../models/orderModel").Coupon;

//admin side coupone page
// =================
const couponPageLoad = async(req,res)=>{
    try {
        res.render('coupon')
    } catch (error) {
        console.log(error.message);
    }
}


//add coupone page load
const addCouponPageLoad = async(req,res)=>{
    try {
        res.render('addcoupon')
    } catch (error) {
        console.log(error.message);
    }
}


// exporting
// =============
module.exports={
    couponPageLoad,
    addCouponPageLoad
}