const UserDB = require("../models/userModel").User;
const ProductDB = require("../models/productsModel").product;
const CartDB = require("../models/userModel").Cart;
const addressDB = require('../models/userModel').UserAddress



// cart total calculate 
// =============================
const calculateTotalPrice = async (userId) => {
    try {
      const cart = await CartDB.findOne({ user: userId }).populate(
        "products.product"
      );
  
      if (!cart) {
        console.log("User does not have a cart.");
      }
  
      let totalPrice = 0;
      for (const cartProduct of cart.products) {
        const { product, quantity } = cartProduct;
        const productSubtotal = product.price * quantity;
        totalPrice += productSubtotal;
      }
  
      // console.log('Total Price:', totalPrice);
      return totalPrice;
    } catch (error) {
      console.error("Error calculating total price:", error.message);
      return 0;
    }
  };


// load checkout page 
// =============================
const checkoutPageLoad = async (req, res) => {
  try {

    const cartDetails = await CartDB.findOne({ user: req.session.user_id })
      .populate({
        path: "products.product",
        select: "product_name",
      })
      .exec();

    if (cartDetails) {

      let total = await calculateTotalPrice(req.session.user_id);
      let userAddress = await addressDB.findOne({userId:req.session.user_id},{addresses:1})
      if(userAddress){
        console.log(userAddress);
        return res.render("checkout", { user: req.session.user_id,total,address:userAddress.addresses });
      }else{
        return res.render("checkout", { user: req.session.user_id,total,address:0 });
      }
    }else{
        res.redirect('/cart')
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  checkoutPageLoad,
};
