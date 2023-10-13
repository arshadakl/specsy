const UserDB = require("../models/userModel").User;
const ProductDB = require("../models/productsModel").product;
const CartDB = require("../models/userModel").Cart;
const addressDB = require("../models/userModel").UserAddress;
const OrderDB = require("../models/orderModel").Order;

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

const daliveryDateCalculate = async () => {
  try {
    // Get the current date
    const currentDate = new Date();

    // Add two days to the current date
    const twoDaysLater = new Date(currentDate);
    twoDaysLater.setDate(currentDate.getDate() + 2);

    // Create an array of day names
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Get the day name for the date two days later
    const dayName = dayNames[twoDaysLater.getDay()];

    // Get the formatted date string
    const formattedDate = `${dayName}, ${twoDaysLater.getDate()} ${twoDaysLater.toLocaleString(
      "en-US",
      { month: "long" }
    )} ${twoDaysLater.getFullYear()}`;

    return formattedDate;
  } catch (error) {
    console.log(error.message);
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
      let userAddress = await addressDB.findOne(
        { userId: req.session.user_id },
        { addresses: 1 }
      );
      if (userAddress) {
        // console.log(userAddress);
        return res.render("checkout", {
          user: req.session.user_id,
          total,
          address: userAddress.addresses,
        });
      } else {
        return res.render("checkout", {
          user: req.session.user_id,
          total,
          address: 0,
        });
      }
    } else {
      return res.redirect("/cart");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// selecting shipping address when place order time
// ==========================================================
const reciveShippingAddress = async (req, res) => {
  try {
    let userAddrs = await addressDB.findOne({ userId: req.session.user_id });

    if (userAddrs) {
      const selectedAddress = userAddrs.addresses.find((address) => {
        return address._id.toString() === req.body.address.toString();
      });

      if (selectedAddress) {
        // console.log("Selected Address:", selectedAddress);
        // res.redirect('/checkout/paymentselection')
        let total = await calculateTotalPrice(req.session.user_id);
        return res.render("paymentselection", {
          user: req.session.user_id,
          address: selectedAddress,
          total,
        });
      } else {
        console.log("Specific address not found.");
      }
    } else {
      console.log("User address document not found.");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const paymentSelectionManage = async (req, res) => {
  try {
    console.log(req.body);
    let addressId = req.body.address;
    let payment =
      req.body.paymentMethod === "COD"
        ? "Cash on Delivery"
        : req.body.paymentMethod;
    console.log(addressId);
    let userAddrs = await addressDB.findOne({ userId: req.session.user_id });
    const selectedAddress = userAddrs.addresses.find((address) => {
      return address._id.toString() === addressId.toString();
    });
    const cartDetails = await CartDB.findOne({ user: req.session.user_id })
      .populate({
        path: "products.product",
        select: "product_name price description frame_shape images.image1",
      })
      .exec();
    // console.log(cartDetails);
    if (cartDetails) {
      let total = await calculateTotalPrice(req.session.user_id);
      let deliveryDate = await daliveryDateCalculate();
      console.log(deliveryDate);
      res.render("finalcheckout", {
        total,
        address: selectedAddress,
        user: req.session.user_id,
        payment,
        cartItems: cartDetails,
        deliveryDate,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const placeOrderManage = async (req, res) => {
  try {
    // console.log(req.body.address);
    let addressId = req.body.address;
    let paymentType = req.body.payment;
    const cartDetails = await CartDB.findOne({ user: req.session.user_id });
    
    let userAddrs = await addressDB.findOne({ userId: req.session.user_id });
    const shipAddress = userAddrs.addresses.find((address) => {
      return address._id.toString() === addressId.toString();
    });
    let {country,fullName,mobileNumber,pincode,city,state} = shipAddress
    console.log(state);

    const cartProducts = cartDetails.products.map((productItem) => ({
      productId: productItem.product,
      quantity: productItem.quantity,
      OrderStatus: "pending"

    }));
    let total = await calculateTotalPrice(req.session.user_id);

    console.log(cartProducts);
    const order = new OrderDB({
      userId: req.session.user_id,
      "shippingAddress.country": country,
      "shippingAddress.fullName": fullName,
      "shippingAddress.mobileNumber": mobileNumber,
      "shippingAddress.pincode": pincode,
      "shippingAddress.city": city,
      "shippingAddress.state": state,
      products: cartProducts,
      totalAmount: total,
      paymentMethod: paymentType,
      paymentStatus: "pending",
    });

    // const order = new OrderDB({
    //   userId: req.session.user_id,
    //   shippingAddressId: addressId,
    //   products: cartProducts,
    //   totalAmount: total,
    //   OrderStatus: "pending",
    //   paymentMethod: paymentType,
    //   paymentStatus: "pending",
    // });
    const placeorder = await order.save();


    if (paymentType !== "Online") {
      console.log(placeorder._id);
      let changeOrderStatus = await OrderDB.updateOne(
        { _id: placeorder._id },
        { $set: { OrderStatus: "success" } }
      );
      console.log(changeOrderStatus);
      await CartDB.deleteOne({user:req.session.user_id})
      return res.render("orderStatus", {
        success: 1,
        user: req.session.user_id
      });
    } else {
      return res.render("orderStatus", {
        success: 0,
        user: req.session.user_id
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// =============+++++++++++++++=======================
// exportings
// ====================
module.exports = {
  checkoutPageLoad,
  reciveShippingAddress,
  paymentSelectionManage,
  placeOrderManage,
};
