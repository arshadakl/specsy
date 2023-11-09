const UserDB = require("../models/userModel").User;
const ProductDB = require("../models/productsModel").product;
const CartDB = require("../models/userModel").Cart;
const addressDB = require("../models/userModel").UserAddress;
const OrderDB = require("../models/orderModel").Order;
const CouponDB = require("../models/orderModel").Coupon;
const PaymentDB = require("../models/paymentModel").TransactionHistory;
const AnalyticsDB = require("../models/analyticModel");
const WalletDB = require("../models/paymentModel").Wallet;
const puppeteer = require("puppeteer");
const path = require("path");
const error500 = path.join(__dirname, 'views', 'error.html')


const Razorpay = require("razorpay");
const mongoose = require("mongoose");
require("dotenv").config();

// razorpay related functions
// ============================
var instance = new Razorpay({
  key_id: process.env.razorpay_key_id,
  key_secret: process.env.razorpay_key_secret,
});

const genarateRazorpay = (orderId, total) => {
  return new Promise((resolve, reject) => {
    var options = {
      amount: total * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: orderId,
    };
    instance.orders.create(options, function (err, order) {
      resolve(order);
    });
  });
};

//genarate Order uniq Id
// --------------------------
const generateUniqueTrackId = async () => {
  try {
    let orderID;
    let isUnique = false;

    // Keep generating order IDs until a unique one is found
    while (!isUnique) {
      // Generate a random 6-digit number
      orderID = Math.floor(100000 + Math.random() * 900000);

      // Check if the order ID already exists in the database
      const existingOrder = await OrderDB.findOne({ orderID });

      // If no existing order with the same orderID is found, it's unique
      if (!existingOrder) {
        isUnique = true;
      }
    }

    return orderID;
  } catch (error) {
    console.log(error.message);
  }
};


               //order analatical creation
// =============================================================================
const CreateOrderAnalatic = async () => {
  try {
    const orders = await OrderDB.find({ "products.OrderStatus": "Delivered" });
    const totalSalesAmount = orders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );
    const totalOrders = orders.length;
    let orderAnalytics = await AnalyticsDB.findOne();
    if (!orderAnalytics) {
      orderAnalytics = new AnalyticsDB({
        totalSalesAmount,
        totalOrders,
      });
    } else {
      orderAnalytics.totalSalesAmount = totalSalesAmount*0.3;
      orderAnalytics.totalOrders = totalOrders;
    }

    let result = await orderAnalytics.save();
    return result;
  } catch (error) {
    console.log(error.message);
  }
};

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
    res.status(500).sendFile(error500)
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
       
        const walletDetails = await WalletDB.findOne({user:req.session.user_id},{balance:1,_id:0});
        console.log(walletDetails.balance);
        let walletStatus = 1;
        if(total>walletDetails.balance){
           walletStatus = 0
        }
        return res.render("paymentselection", {
          user: req.session.user_id,
          address: selectedAddress,
          total,walletStatus,
        });
      } else {
        console.log("Specific address not found.");
      }
    } else {
      console.log("User address document not found.");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).sendFile(error500)
  }
};


// it used to select payment method
// ====================================================================
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
    res.status(500).sendFile(error500)
  }
};

// ===========================
//  ###    //place order
// ==============================
const placeOrderManage = async (req, res) => {
  let discountDetails = {
    codeId: 0,
    amount: 0,
  };
  try {
    // console.log(req.body.address);
    let addressId = req.body.address;

    let paymentType = req.body.payment;
    console.log("PYAMENT TYPE: "+paymentType);
    const cartDetails = await CartDB.findOne({ user: req.session.user_id });

    let userAddrs = await addressDB.findOne({ userId: req.session.user_id });
    const shipAddress = userAddrs.addresses.find((address) => {
      return address._id.toString() === addressId.toString();
    });

    // console.log("collected:", shipAddress);

    if (!shipAddress) {
      return res.status(400).json({ error: "Address not found" });
    }
    // console.log("collected :" + shipAddress);
    const { country, fullName, mobileNumber, pincode, city, state } =
      shipAddress;
    // console.log(state);

    const cartProducts = cartDetails.products.map((productItem) => ({
      productId: productItem.product,
      quantity: productItem.quantity,
      OrderStatus: "pending",
      StatusLevel: 1,
      paymentStatus: "pending",
      "returnOrderStatus.status": "none",
      "returnOrderStatus.reason": "none",
    }));
    let total = await calculateTotalPrice(req.session.user_id);
    //coupon checking
    // ===================
    if (req.body.coupon != "") {
      const couponDetails = await CouponDB.findById(req.body.coupon);
      total -= couponDetails.discount_amount;
      discountDetails.codeId = couponDetails._id;
      discountDetails.amount = couponDetails.discount_amount;
      couponDetails.usersUsed.push(req.session.user_id);
      await couponDetails.save();
    }

    // console.log(cartProducts);
    const trackId = await generateUniqueTrackId();
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
      coupon: req.body.coupon ? req.body.coupon : "none",
      orderDate: new Date(),
      trackId,
    });
    const walletDetails = await WalletDB.findOne({user:req.session.user_id})
    if (paymentType === "wallet" && total>walletDetails.balance) {
      return res.json({
        cod: true,
        orderId: 0,
        status: "Fail",
      });

    }

    const placeorder = await order.save();
    // let analaticResult = await CreateOrderAnalatic();
    // console.log(analaticResult);
    console.log(placeorder._id);
    if (paymentType == "Cash on Delivery") {
      console.log(placeorder._id);
      let changeOrderStatus = await OrderDB.updateOne(
        { _id: placeorder._id },
        {
          $set: {
            "products.$[].OrderStatus": "placed",
          },
        }
      );
      let changePaymentStatus = await OrderDB.updateOne(
        { _id: placeorder._id },
        {
          $set: {
            "products.$[].paymentStatus": "success",
          },
        }
      );
      // console.log(changeOrderStatus);
      await CartDB.deleteOne({ user: req.session.user_id });
      const PaymentHistory = await createPaymentHistory(
        req.session.user_id,
        placeorder,
        paymentType,
        discountDetails,
        trackId
      );
      console.log(PaymentHistory);
      // return res.render("orderStatus", {
      //   success: 1,
      //   user: req.session.user_id
      // });
      return res.json({
        cod: true,
        orderId: placeorder._id,
        status: "success",
      });
    } else if(paymentType === "Online") {
      //here manage when the order is online
      let order = await genarateRazorpay(placeorder._id, total);

      let userData = await UserDB.findById(req.session.user_id);

      // payment history create
      const PaymentHistory = await createPaymentHistory(
        req.session.user_id,
        placeorder,
        paymentType,
        discountDetails,
        trackId
      );
      console.log(PaymentHistory);
      let user = {
        name: fullName,
        mobile: mobileNumber,
        email: userData.email,
      };
      return res.json({ order, user });
    }else if(paymentType === "wallet"){

      //wallet managment##################
      
      console.log(placeorder._id);
      let changeOrderStatus = await OrderDB.updateOne(
        { _id: placeorder._id },
        {
          $set: {
            "products.$[].OrderStatus": "placed",
          },
        }
      );
      let changePaymentStatus = await OrderDB.updateOne(
        { _id: placeorder._id },
        {
          $set: {
            "products.$[].paymentStatus": "success",
          },
        }
      );
      // console.log(changeOrderStatus);
      await CartDB.deleteOne({ user: req.session.user_id });
      walletDetails.balance -= total
      await walletDetails.save();
      const PaymentHistory = await createPaymentHistory(
        req.session.user_id,
        placeorder,
        paymentType,
        discountDetails,
        trackId
      );
      console.log(PaymentHistory);
      // return res.render("orderStatus", {
      //   success: 1,
      //   user: req.session.user_id
      // });
      return res.json({
        cod: true,
        orderId: placeorder._id,
        status: "success",
      });

    }
  } catch (error) {
    console.log(error.message);
    res.status(500).sendFile(error500)
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
        const userDetails = await UserDB.findById(order.userId)
        .select(
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
              paymentStatus: productInfo.paymentStatus,
              quantity: productInfo.quantity,
            },
          });
        }
      }
    }

    // for(i=0;i<productWiseOrdersArray.length;i++){
    // console.log(productWiseOrdersArray);
    // }
    res.render("orders", { orders: productWiseOrdersArray });
  } catch (error) {
    console.log(error.message);
    res.status(500).sendFile(error500)
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
        paymentStatus: productInfo.paymentStatus,
        quantity: productInfo.quantity,
      },
    };
    // console.log(productOrder);
    // console.log();
    res.render("orderManagment", { product: productOrder, orderId, productId });
  } catch (error) {
    console.log(error.message);
    res.status(500).sendFile(error500)
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
    productInfo.updatedAt = Date.now();

    if(order.paymentMethod!=="Cash on Delivery"){
      req.session.OrderCanceled = 2
      let refundStatus = await refundManagement(
        oderId,
        productId,
        order.trackId,
        req.session.user_id
      );
      console.log();
    }else{
      req.session.OrderCanceled = 1
    }

    
    const result = await order.save();

    console.log(result);
    res.json({ cancel: 1 });
  } catch (error) {
    console.log(error.message);
    res.status(500).sendFile(error500)
  }
};


// cange order status
// -------------------------
const changeOrderStatus = async (req, res) => {
  try {
    const { status, orderId, productId } = req.body;
    const order = await OrderDB.findById(orderId);
    // find status level

    const statusMap = {
      Shipped: 2,
      OutforDelivery: 3,
      Delivered: 4,
    };

    const selectedStatus = status;
    const statusLevel = statusMap[selectedStatus];

    console.log(statusLevel);
    // find status levelend

    console.log(order);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    if(status=="Delivered"){
      let analaticResult = await CreateOrderAnalatic();
      console.log(analaticResult);
    } 

    // Find the product within the order by its ID (using .toString() for comparison)
    const productInfo = order.products.find(
      (product) => product.productId.toString() === productId
    );
    console.log(productInfo);
    productInfo.OrderStatus = status;
    productInfo.StatusLevel = statusLevel;
    productInfo.updatedAt = Date.now();
     
    const result = await order.save();

    console.log(result);
    // console.log(req.body);
    res.redirect(
      `/admin/orders/manage?orderId=${orderId}&productId=${productId}`
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).sendFile(error500)
  }
};


//payment verification
// --------------------------
const verifyPayment = async (req, res) => {
  try {
    console.log("verify fn called ...");
    console.log(req.body);
    const paymentDetails = req.body.payment;
    paymentSignatureMatching(paymentDetails)
      .then(async () => {
        let changeOrderStatus = await OrderDB.updateOne(
          { _id: req.body.order.receipt },
          {
            $set: {
              "products.$[].OrderStatus": "placed",
            },
          }
        );
        let changePaymentStatus = await OrderDB.updateOne(
          { _id: req.body.order.receipt },
          {
            $set: {
              "products.$[].paymentStatus": "success",
            },
          }
        );
        console.log(changePaymentStatus, changeOrderStatus);
        let usercartDelete = await CartDB.deleteOne({
          user: req.session.user_id,
        });
        console.log(usercartDelete);
        console.log("payment success");
        res.json({ status: "success" });
      })
      .catch((err) => {
        res.json({ status: "fail" });
      });
  } catch (error) {}
};

//razorpay payment  Signature Matching
// ---------------------------------------

const paymentSignatureMatching = (payment) => {
  return new Promise((resolve, reject) => {
    const crypto = require("crypto");

    // Replace "your_webhook_secret_key" with your actual webhook secret key
    const webhookSecretKey = process.env.razorpay_key_secret;

    const hmac = crypto.createHmac("sha256", webhookSecretKey);
    hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id);
    const calculatedHmac = hmac.digest("hex");

    // console.log("Calculated HMAC: " + calculatedHmac);
    // console.log("Received HMAC: " + payment.razorpay_signature);

    if (calculatedHmac === payment.razorpay_signature) {
      resolve();
    } else {
      console.log("Invalid payment signature.");
    }
  });
};


//change payment status
// --------------------


const orderStatusPageLoad = async (req, res) => {
  try {
    // const orderId = req.query.id;
    console.log(req.body);
    // let orderDetails = await OrderDB.findOne({ _id: orderId });
    if (req.body.status == "success") {
      return res.render("orderStatus", {
        success: 1,
        user: req.session.user_id,
      });
    } else {
      return res.render("orderStatus", {
        success: 0,
        user: req.session.user_id,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).sendFile(error500)
  }
};


// create payment history
// --------------------------------
const createPaymentHistory = async (
  userId,
  order,
  paymentMethod,
  discount,
  trackId
) => {
  try {
    const newTransaction = new PaymentDB({
      userId: userId,
      orderDetails: [
        {
          orderId: order._id,
          orderDate: order.orderDate,
          products: order.products, // Include product IDs and quantities
        },
      ],
      paymentMethod: paymentMethod,
      totalAmount: order.totalAmount,
      discount: {
        discount_amount: discount.amount,
        code_id: discount.codeId,
        refund_used: false,
      },
      purpose: "Purchase ",
      trackId,
    });

    // Save the transaction history entry
    const transaction = await newTransaction.save();
    console.log("Transaction history entry created:", transaction);
    return transaction;
  } catch (error) {
    console.log(error.message);
  }
};


//order report maker
// ========================
const generateReport = async (dateRange) => {
  try {
    let startDate;
    let endDate = new Date(); // By default, the end date is the current date
    endDate.setHours(23, 59, 59);

    // Calculate the start date based on the date range
    switch (dateRange) {
      case "daily":
        startDate = new Date(); // Set start date to the current date for daily report
        break;
      case "weekly":
        startDate = new Date(); // Set start date to the current date for weekly report
        startDate.setDate(startDate.getDate() - 7); // Go back 7 days for a week
        break;
      case "yearly":
        startDate = new Date(); // Set start date to the current date for yearly report
        startDate.setFullYear(startDate.getFullYear() - 1); // Go back 1 year
        break;
      default:
        // Handle other date ranges or provide an error message
        break;
    }

    // Retrieve orders within the specified date range
    const orders = await OrderDB.find({
      orderDate: { $gte: startDate, $lte: endDate },
    });

    // Perform calculations to generate the report
    const SalesAmount = await AnalyticsDB.find(
      {},
      { totalSalesAmount: 1, _id: 0 }
    );
    const totalSalesAmount = SalesAmount.totalSalesAmount;
    const totalOrders = orders.length;

    // Create a new report document
    const report = new OrderReport({
      reportDate: endDate, // Use the end date as the report date
      totalSalesAmount,
      totalOrders,
    });

    // Save the report to the database
    await report.save();

    console.log(`Generated ${dateRange} report for ${endDate}`);
  } catch (error) {
    console.log(error.message);
  }
};

//return ordered Product
// ------------------------------
const returnOrderProduct = async (req, res) => {
  try {
    // const orderId = req.body.orderId;
    // const productId = req.body.productId;
    const { orderId, productId, reason } = req.body.formDataObject;
    // console.log(orderId, productId , reason);
    const order = await OrderDB.findOne({ _id: orderId });
    const product = order.products.find(
      (product) => product.productId.toString() === productId
    );
    if (!product) {
      return res.json({ status: false });
    }
    product.OrderStatus = "Returned";
    product.returnOrderStatus.status = "Returned";
    product.returnOrderStatus.reason = reason;

    if (reason != "damaged") {
      const qty = product.quantity;
      await increaseStock(product.productId, qty);
    }

    let refundStatus = await refundManagement(
      orderId,
      productId,
      order.trackId,
      req.session.user_id
    );
    // console.log(refundStatus);
    let result = await order.save();
    console.log(result);
    return res.json({ status: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).sendFile(error500)

  }
};

// return refund management
// ---------------------------------
const refundManagement = async (orderId, productId, trackId, userId) => {
  try {
    console.log(trackId);
    console.log("refund called");
    const userWallet = await WalletDB.findOne({ user: userId });
    const TransactionHistory = await PaymentDB.findOne({ trackId });
    const returnProduct = await ProductDB.findOne({ _id: productId });
    let refundAmount = returnProduct.price;

    if (
      TransactionHistory.discount.discount_amount != 0 &&
      !TransactionHistory.discount.refund_used
    ) {
      refundAmount -= TransactionHistory.discount.discount_amount;
    }
    userWallet.balance += refundAmount;
    let Wallet = "Wallet";
    const trackIdRF = await generateUniqueTrackId();
    let RefundHistory = await createRefundHistory(
      userId,
      Wallet,
      trackIdRF,
      orderId,
      returnProduct._id,
      refundAmount
    );
    // console.log(RefundHistory);
    let result = await userWallet.save();
    return result;

    // console.log(userWallet);
  } catch (error) {
    console.log(error.message);
  }
};

//refund transaction history creating
// -------------------------------------------
const createRefundHistory = async (
  userId,
  paymentMethod,
  trackId,
  orderId,
  productId,
  refundAmount
) => {
  try {
    console.log("createRefundHistory called");
    let products = [productId];
    const newRefundTransaction = new PaymentDB({
      userId: userId,
      orderDetails: [
        {
          orderId: orderId,
          orderDate: new Date(),
          products: products, // Include product IDs and quantities
        },
      ],
      paymentMethod: paymentMethod,
      totalAmount: refundAmount,
      discount: {
        discount_amount: 0,
        code_id: "none",
        refund_used: false,
      },
      purpose: "Refund",
      trackId,
    });

    // Save the transaction history entry
    const transaction = await newRefundTransaction.save();
    console.log(transaction);
    console.log("Transaction history entry created:", transaction);
    return transaction;
  } catch (error) {
    console.log(error.message);
  }
};

//decrease the product stock
// ----------------------------
const decreaseStock = async (productId, quantity) => {
  try {
    const product = await ProductDB.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    if (product.stock < quantity) {
      throw new Error("Not enough stock available");
    }
    product.stock -= quantity;
    const result = await product.save();
    return result;
  } catch (error) {
    console.log(error.message);
  }
};

//increase the product stock
// --------------------------------
const increaseStock = async (productId, quantity) => {
  try {
    const product = await ProductDB.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    product.stock += quantity;
    const result = await product.save();
    return result;
  } catch (error) {
    console.log(error.message);
  }
};

// oder invoices
// ----------------
const downloadInvoices = async (req, res) => {
  try {
    const { productId, orderId } = req.query;
    // console.log("called machaaaaa...");
    console.log(productId, orderId);
    const invoiceData = await genarateInvoice(orderId, productId);
    await generateInvoicePDF(invoiceData);

    // Set the Content-Type and Content-Disposition headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

    // Send the PDF file
    res.sendFile("invoice.pdf", { root: "./" }); // Adjust the root directory as needed
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error generating or serving the PDF report");
  }
};

//user order invoice genarate
// ------------------------------
const genarateInvoice = async (orderId, productId) => {
  try {
    const order = await OrderDB.findOne({ _id: orderId });
    const productDetails = await ProductDB.findOne({ _id: productId });
    const product = order.products.find(
      (product) => product.productId.toString() === productId
    );
    // console.log(productDetails);
    // if(!product){
    //   return res.json({status:false});
    // }
    let invoice = {
      orderId: orderId,
      trackId: order.trackId,
      address: order.shippingAddress,
      qty: product.quantity,
      productDetails: productDetails,
      orderDate: order.orderDate,
      totalAmount: order.totalAmount,
      paymentMethod:order.paymentMethod
    };
    return invoice;
    // console.log(product);
    // product.OrderStatus="Invoiced";
    // product.returnOrderStatus.status="Invoiced";
    // product.returnOrderStatus.reason="";
  } catch (error) {
    console.log(error.message);
  }
};

const generateInvoicePDF = async (invoiceData) => {
  try {
    const orderDate = formatDateTime(invoiceData.orderDate);
    console.log(invoiceData);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Create an HTML template for the invoice
    const htmlContent = `
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
    crossorigin="anonymous">
    <style>
        body {
            background: #ffffff;
            margin-top: 0px;
        }

        .text-danger strong {
            color: #9f181c;
        }

        .receipt-main {
            background: #ffffff none repeat scroll 0 0;
            border-top: 12px solid #9f181c;
            /* margin-top: 50px; */
            /* margin-bottom: 50px; */
            padding: 40px 30px !important;
            position: relative;
            /* box-shadow: 0 1px 21px #acacac; */
            color: #333333;
            font-family: open sans;
        }

        .receipt-main p {
            color: #333333;
            font-family: open sans;
            line-height: 1.42857;
        }

        .receipt-footer h1 {
            font-size: 15px;
            font-weight: 400 !important;
            margin: 0 !important;
        }

        .receipt-main::after {
            background: #414143 none repeat scroll 0 0;
            content: "";
            height: 5px;
            left: 0;
            position: absolute;
            right: 0;
            top: -13px;
        }

        .receipt-main thead {
            background: #414143 none repeat scroll 0 0;
        }

        .receipt-main thead th {
            color: #fff;
        }

        .receipt-right h5 {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 7px 0;
        }

        .receipt-right p {
            font-size: 12px;
            margin: 0px;
        }

        .receipt-right p i {
            text-align: center;
            width: 18px;
        }

        .receipt-main td {
            padding: 9px 20px !important;
        }

        .receipt-main th {
            padding: 13px 20px !important;
        }

        .receipt-main td {
            font-size: 13px;
            font-weight: initial !important;
        }

        .receipt-main td p:last-child {
            margin: 0;
            padding: 0;
        }

        .receipt-main td h2 {
            font-size: 20px;
            font-weight: 900;
            margin: 0;
            text-transform: uppercase;
        }

        .receipt-header-mid .receipt-left h1 {
            font-weight: 100;
            margin: 34px 0 0;
            text-align: right;
            text-transform: uppercase;
        }

        .receipt-header-mid {
            margin: 24px 0;
            overflow: hidden;
        }

        #container {
            background-color: #dcdcdc;
        }
    </style>
</head>

<body >
<div class="col-md-12">
<div class="row col-12" style="width: 100%;">

<div class="receipt-main col-12 col-xs-offset-1 col-sm-offset-1 col-md-offset-3">
<div class="row">
<div class="receipt-header">
<div class="col-xs-6 col-sm-6 col-md-6">
<div class="receipt-left">
<img class="img-responsive" alt="iamgurdeeposahan" src="https://raw.githubusercontent.com/arshadakl/specsy/main/public/user/images/logo.png"
                                style="width: 120px; border-radius: 43px;">
</div>
</div>
<div class="col-xs-6 col-sm-6 col-md-6 text-right">
<div class="receipt-right">
<h5>Eyewear Frames</h5>
<p>www.specsy.com </p>
</div>
</div>
</div>
</div>

<div class="row">
<div class="receipt-header receipt-header-mid d-flex justify-content-between">
<div class="col-xs-6 col-sm-6 col-md-6 text-left">
<div class="receipt-right">
<h5>Bill To </h5>
<h6>${invoiceData.address.fullName}</h6>
<p> +91 ${invoiceData.address.mobileNumber}</p>
<p>${invoiceData.address.city}, ${invoiceData.address.state}</p>
<p>${invoiceData.address.country}, ${invoiceData.address.pincode}</p>

</div>
</div>
<div class="col-xs-6 col-sm-6 col-md-6 text-right d-flex justify-content-center">
<div class="receipt-right ">
<h5>Shipping Address </h5>
<h6>${invoiceData.address.fullName}</h6>
<p> +91 ${invoiceData.address.mobileNumber}</p>
<p>${invoiceData.address.city}, ${invoiceData.address.state}</p>
<p>${invoiceData.address.country}, ${invoiceData.address.pincode}</p>
</div>

</div>


</div>
</div>
<div class="receipt-left">
<h5>Invoice #${invoiceData.trackId}</h5>
</div>

<div>
<table class="table table-bordered">
<thead>

</thead>
<tbody>
<tr>
<td class="col-md-9">
<p><b>Product Details</b></p>
<p class="m-0"><b>${invoiceData.productDetails.product_name}</b></p>
<p class="m-0">Categoty :${invoiceData.productDetails.frame_shape}</p>
<p class="m-0">Quantity:${invoiceData.qty}</p>
<p class="m-0"><b>Price:₹ ${invoiceData.productDetails.price}</b></p>


</td>

</tr>

<tr>
<td class="text-right">
<p>
<strong>Total Amount: </strong>
</p>
<p>
<strong>Payment method: </strong>
</p>
</td>
<td>
<p>
<strong><i class="fa fa-inr"></i> ${invoiceData.productDetails.price*invoiceData.qty}/-</strong>
</p>
<p>
<strong><i class="fa fa-inr"></i> ${invoiceData.paymentMethod}</strong>
</p>
</td>
</tr>
<tr>

<td class="text-right">
<h2><strong>Total: </strong></h2>
</td>
<td class="text-left text-danger">
<h2><strong><i class="fa fa-inr"></i>₹ ${invoiceData.productDetails.price*invoiceData.qty}/-</strong></h2>
</td>
</tr>
</tbody>
</table>
</div>

<div class="row">
<div class="receipt-header receipt-header-mid receipt-footer">
<div class="col-xs-4 col-sm-4 col-md-4 mb-5">
<div class="receipt-left">
<img style="width: 180px;" src="https://raw.githubusercontent.com/arshadakl/covid-tracking/gh-pages/static/css/signature.png"
                                alt="">
</div>
</div>
<div class="col-xs-8 col-sm-8 col-md-8 text-left">
<div class="receipt-right">
<p><b>Date :</b> ${orderDate}</p>
<h5 style="color: rgb(140, 140, 140);">Thanks for shopping.!</h5>
</div>
</div>

</div>
</div>

</div>
</div>
</div>
</body>
    `;

    await page.setContent(htmlContent);
    await page.pdf({
      path: "invoice.pdf",
      format: "A4",
      printBackground: true,
    });

    await browser.close();
  } catch (error) {
    console.error(error.message);
    
  }
};





function formatDateTime(dateString) {
  const date = new Date(dateString);
  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  };
  return date.toLocaleString(undefined, options).replace(',', '');
}

const amountVerify = async(req,res)=>{
  try {
    const total = await calculateTotalPrice(req.session.user_id);
    res.json(total);
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
  verifyPayment,
  orderStatusPageLoad,
  returnOrderProduct,
  downloadInvoices,
  amountVerify
};
