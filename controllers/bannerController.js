const UserDB = require("../models/userModel").User;
const ProductDB = require("../models/productsModel").product;
const CategoryDB = require("../models/productsModel").category;
const OrderDB = require("../models/orderModel").Order;
const BannerDB = require("../models/productsModel").banner;


const BannerPageLoader = async(req,res)=>{
    try {
        res.render('banner')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    BannerPageLoader
}