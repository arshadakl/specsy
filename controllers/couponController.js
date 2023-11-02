const UserDB = require("../models/userModel").User;
const ProductDB = require("../models/productsModel").product;
const CartDB = require("../models/userModel").Cart;
const addressDB = require("../models/userModel").UserAddress;
const OrderDB = require("../models/orderModel").Order;
const CouponDB = require("../models/orderModel").Coupon;

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

//admin side coupone page
// =================
const couponPageLoad = async (req, res) => {
  try {
    const Coupons = await CouponDB.find();
    res.render("coupon", { Coupons });
  } catch (error) {
    console.log(error.message);
  }
};

//add coupone page load
const addCouponPageLoad = async (req, res) => {
  try {
    res.render("addcoupon");
  } catch (error) {
    console.log(error.message);
  }
};

// manage adding coupons
// ------------------------
const addNewCoupon = async (req, res) => {
  try {
    const {
      code,
      discount_amount,
      validFrom,
      validTo,
      description,
      minimumSpend,
      maxUsers,
    } = req.body;
    const coupon = new CouponDB({
      code,
      discount_amount,
      validFrom,
      validTo,
      description,
      minimumSpend,
      maxUsers,
    });
    await coupon.save();
    return res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
  }
};

//coupon page load on user profile
// ----------------------------
const couponUserPageLoad = async (req, res) => {
  try {
    const coupons = await CouponDB.find();
    console.log(coupons);
    res.render("coupons", { user: req.session.user_id, coupons });
  } catch (error) {
    console.log(error.message);
  }
};

//Manage validation coupon from user redeem
// ---------------------
const ApplyCoupon = async (req, res) => {
  try {
    let couponCode = req.body.code;
    let userId = req.session.user_id;
    let cartTotalAmount = await calculateTotalPrice(userId);

    const coupon = await CouponDB.findOne({ code: couponCode });
    console.log(coupon);
    if (coupon == null) {
      console.log("condition called ..");
      return res.json({ valid: false, message: "Coupon not Valid" });
    }

    if (coupon.usersUsed.includes(userId)) {
      return res.json({
        valid: false,
        message: "You have already claimed this coupon",
      });
    }

    const currentDate = new Date();
    if (currentDate < coupon.validFrom || currentDate > coupon.validTo) {
      return res.json({ valid: false, message: "Coupon is not valid" });
    }

    if (cartTotalAmount < coupon.minimumSpend) {
      return res.json({
        valid: false,
        message: "The minimum spend has not been met",
      });
    }

    // Check if the maximum number of users have already redeemed the coupon
    if (coupon.usersUsed.length >= coupon.maxUsers) {
      return res.json({
        valid: false,
        message: "Coupon has reached the maximum usage limit",
      });
    }

    coupon.usersUsed.push(userId);
    await coupon.save();
    let redeem = {
      code: coupon.code,
      discount: coupon.discount_amount,
      total: cartTotalAmount - coupon.discount_amount,
      _id: coupon._id,
    };
    return res.json({ valid: true, redeem });
  } catch (error) {
    console.log(error.message);
  }
};

//delete coupons
// --------------------
const deleteCoupon = async (req, res) => {
  try {
    const deleteCoupon = await CouponDB.deleteOne({ _id: req.query.id });
    console.log(deleteCoupon);
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
  }
};

//Editcoupone page load
// ==========================
const editCouponPageLoad = async (req, res) => {
  try {
    console.log(req.query.id);
    const coupon = await CouponDB.findOne({ _id: req.query.id });
    console.log(coupon);
    res.render("editcoupon", { coupon: coupon });
  } catch (error) {
    console.log(error.message);
  }
};

const editCoupon = async (req, res) => {
  try {
    console.log(req.body);
    const {
      code,
      discount_amount,
      validFrom,
      validTo,
      description,
      minimumSpend,
      maxUsers,
    } = req.body;

    const validFromDate = validFrom; // No conversion needed
    const validToDate = validTo; // No conversion needed

    const updateCoupon = await CouponDB.updateOne(
      { _id: req.query.id },
      {
        $set: {
          code: code,
          discount_amount: discount_amount,
          validFrom: validFromDate,
          validTo: validToDate,
          description: description,
          minimumSpend: minimumSpend,
          maxUsers: maxUsers,
        },
      }
    );

    // const coupon = await CouponDB.findOne({ _id: req.query.id });
    // console.log(req.query.id);
    // if (!coupon) {
    //   return { success: false, message: "Coupon not found" };
    // }

    // // Update the coupon properties with the new data
    // coupon.couponCode = updatedData.couponCode;
    // coupon.validFrom = updatedData.validFrom;
    // coupon.validTo = updatedData.validTo;
    // coupon.minSpend = updatedData.minSpend;
    // coupon.maxUsers = updatedData.maxUsers;
    // coupon.usersUsed = updatedData.usersUsed;

    // // Save the updated coupon
    // await coupon.save();
    // console.log(updateCoupon);
    return res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
  }
};

// exporting
// =============
module.exports = {
  couponPageLoad,
  addCouponPageLoad,
  addNewCoupon,
  couponUserPageLoad,
  ApplyCoupon,
  deleteCoupon,
  editCouponPageLoad,
  editCoupon,
};
