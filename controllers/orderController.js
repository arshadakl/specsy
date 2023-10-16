const UserDB = require("../models/userModel").User;
const ProductDB = require("../models/productsModel").product;
const CartDB = require("../models/userModel").Cart;
const addressDB = require("../models/userModel").UserAddress;
const OrderDB = require("../models/orderModel").Order;


// This Function used to formmate date from new Date() function
// ==============================================================
function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

// this function use to take all user Data
// ---------------------------------------
const getAlluserData = () => {
  return new Promise(async (resolve, reject) => {
    let userData = await UserDB.find({});
    resolve(userData);
  });
};
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

// it used to select payment method 
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

//place order 
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
      OrderStatus: "pending",
      StatusLevel:1

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




// orders page load
// ----------------------
const orderPageLoad = async (req, res) => {
  try {
    const orders = await OrderDB.find();

    const productWiseOrdersArray = [];

    for (const order of orders) {
      for (const productInfo of order.products) {
        const productId = productInfo.productId;

        
        const product = await ProductDB.findById(productId).select(
          "product_name images price"
        );
        const userDetails = await UserDB.findById(order.userId).select(
          "userName"
        );
        // console.log(userDetails);
        if (product) {
          // Push the order details with product details into the array
          orderDate = await formatDate(order.orderDate);
          productWiseOrdersArray.push({
            user: userDetails,
            product: product,
            orderDetails: {
              _id: order._id,
              userId: order.userId,
              shippingAddress: order.shippingAddress,
              orderDate: orderDate,
              totalAmount: productInfo.quantity * product.price,
              OrderStatus: productInfo.OrderStatus,
              StatusLevel: productInfo.StatusLevel,
              paymentMethod: order.paymentMethod,
              paymentStatus: order.paymentStatus,
              quantity: productInfo.quantity,
            },
          });
        }
      }
    }

    // for(i=0;i<productWiseOrdersArray.length;i++){
    console.log(productWiseOrdersArray);
    // }
    res.render("orders", { orders: productWiseOrdersArray });
  } catch (error) {
    console.log(error.message);
  }
};

// order management page load
// ------------------------------
const orderMangePageLoad = async (req, res) => {
  try {
    const { orderId, productId } = req.query;
    // console.log(orderId, productId);
    const order = await OrderDB.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .sendFile(path.dirname(__dirname, "views", "404.html"));
    }
    const productInfo = order.products.find(
      (product) => product.productId.toString() === productId
    );
    const product = await ProductDB.findById(productId).select(
      "product_name images "
    );
    let orderDate = formatDate(order.orderDate);
    const productOrder = {
      orderId: order._id,
      product: product,
      orderDetails: {
        _id: order._id,
        userId: order.userId,
        shippingAddress: order.shippingAddress,
        orderDate,
        totalAmount: order.totalAmount,
        OrderStatus: productInfo.OrderStatus,
        StatusLevel: productInfo.StatusLevel,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        quantity: productInfo.quantity,
      },
    };
    // console.log(productOrder);
    // console.log();
    res.render("orderManagment", { product: productOrder, orderId, productId });
  } catch (error) {
    console.log(error.message);
  }
};

// order cancel
// -----------------------
const cancelOrder = async (req, res) => {
  try {
   

    const { oderId, productId } = req.body;
    // orderId = orderId.toString
    console.log(oderId);

    const order = await OrderDB.findById(oderId);

    console.log(order);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Find the product within the order by its ID (using .toString() for comparison)
    const productInfo = order.products.find(
      (product) => product.productId.toString() === productId
    );
    console.log(productInfo);
    productInfo.OrderStatus = "canceled";
    const result = await order.save();

    console.log(result);
    res.json({cancel:1})
  } catch (error) {
    console.log(error.message);
  }
};

// cange order status
// -------------------------
const changeOrderStatus = async(req,res)=>{
  try {
    const {status,orderId,productId} = req.body
    const order = await OrderDB.findById(orderId);
    // find status level

    const statusMap = {
      "Shipped": 2,
      "OutforDelivery": 3,
      "Delivered": 4
    };
    
    const selectedStatus = status;
    const statusLevel = statusMap[selectedStatus];
    
    console.log(statusLevel); 
    // find status levelend


    console.log(order);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Find the product within the order by its ID (using .toString() for comparison)
    const productInfo = order.products.find(
      (product) => product.productId.toString() === productId
    );
    console.log(productInfo);
    productInfo.OrderStatus = status;
    productInfo.StatusLevel = statusLevel;

    const result = await order.save();

    console.log(result);
    // console.log(req.body);
      res.redirect(`/admin/orders/manage?orderId=${orderId}&productId=${productId}`)
  } catch (error) {
    console.log(error.message);
  }
}





// =============+++++++++++++++=======================
// exportings
// ====================
module.exports = {
  checkoutPageLoad,
  reciveShippingAddress,
  paymentSelectionManage,
  placeOrderManage,
  orderPageLoad,
  orderMangePageLoad,
  cancelOrder,
  changeOrderStatus,

};
