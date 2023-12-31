const express = require("express");
const router = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/user");
const fileUpload = require("../middleware/fileUpload");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.set("view engine", "ejs");
router.set("views", "./views/user/");

const userController = require("../controllers/userController");
const productController = require("../controllers/productsController");
const orderController = require("../controllers/orderController");
const wishlistController = require("../controllers/wishlistController");
const couponController = require("../controllers/couponController");
const walletController = require("../controllers/walletController");

router.get("/", userController.homePageLoad);

// =================// auth related ============================
router.get("/signup", auth.isLogout, userController.loadSignup);
router.post("/signup", auth.isLogout, userController.inserUser);
router.get("/login", auth.isLogout, userController.loginPageLoad);
router.post("/login", auth.isLogout, userController.doLogin);
router.get("/logout", userController.doLogout);

// =================// passsword manage related routers================
router.post("/changepassword", userController.changepassword);
router.get("/forgetpassword", userController.forgetpasswordPageLoad);
router.post("/forgetpassword", userController.manageForgetPassword);
router.post("/forgetotp", userController.forgetOTPpageLoad);
router.post("/createnewpass", userController.createNewpassword);

// =================// otp related routers=======================
router.get("/otp", userController.optPageLoad);
router.post("/otp", userController.otpValid);
router.get("/expire", userController.otpValid);
router.post("/reotp", userController.reVerifyUser);
router.get("/verifypage", userController.verifyPageLoad);

// =================// user profile related routers=======================
router.get("/profile", auth.isLogin, userController.profilePageLoad);
router.post("/updateUser", auth.isLogin, userController.updateUserData);
router.post(
  "/updatePhoto",
  auth.isLogin,
  fileUpload.upload.single("image"),
  userController.updatePhoto
);

// =================// user cart related routers ========================
router.get("/cart", auth.isLogin, userController.cartPageLoad);
router.post("/addtocart", auth.jsonIsLogin, userController.addtoCart);
router.post(
  "/changeqty",
  auth.jsonIsLogin,
  userController.productQuantityHandlling
);
router.delete(
  "/removecartproduct",
  auth.isLogin,
  userController.removeCartItem
);

// =================// product related routers=====================
router.get("/product", productController.singleProductLoad);

// =================// order related routers======================
router.get("/checkout", auth.isLogin, orderController.checkoutPageLoad);
router.post("/checkout", auth.isLogin, orderController.reciveShippingAddress);
router.post(
  "/checkout/paymentselection",
  auth.isLogin,
  orderController.paymentSelectionManage
);
router.post(
  "/checkout/placeorder",
  auth.isLogin,
  orderController.placeOrderManage
);
router.get(
  "/checkout/placeorder",
  auth.isLogin,
  orderController.orderStatusPageLoad
);
router.post(
  "/checkout/placeorder/verify-payment",
  auth.isLogin,
  orderController.orderStatusPageLoad
);
router.get(
  "/checkout/placeorder/amountverify",
  auth.isLogin,
  orderController.amountVerify
);

// =================//add address ===================================
router.post("/shippingaddress", userController.addShippingAddress);
router.get(
  "/profile/user_address",
  auth.isLogin,
  userController.loadShippingAddressPage
);
router.post(
  "/profile/user_address",
  auth.isLogin,
  userController.addShippingAddressFromProfile
);
router.post(
  "/profile/user_address/edit",
  auth.isLogin,
  userController.updateShippingAddress
);
router.delete(
  "/profile/user_address/delete",
  auth.isLogin,
  userController.deleteShippingAddress
);

// =================// view orders related ========================
router.get("/profile/orders", auth.isLogin, userController.allOrdersPageLoad);
router.post(
  "/profile/orders/cancel",
  auth.isLogin,
  orderController.cancelOrder
);
router.post(
  "/profile/orders/return",
  auth.isLogin,
  orderController.returnOrderProduct
);
router.get(
  "/profile/orders/invoice",
  auth.isLogin,
  orderController.downloadInvoices
);

//payment related
router.post(
  "/checkout/verify-payment",
  auth.isLogin,
  orderController.verifyPayment
);

// =================//wishlist related// =================
router.get("/wishlist", auth.isLogin, wishlistController.wishListPageLoad);
router.post(
  "/addtowishlist",
  auth.jsonIsLogin,
  wishlistController.addToWishlist
);
router.delete(
  "/removewishitem",
  auth.jsonIsLogin,
  wishlistController.removeItemFromWish
);

// =================//coupons=========================================
router.get(
  "/profile/coupons",
  auth.isLogin,
  couponController.couponUserPageLoad
);
router.post("/checkout/placeorder/coupon", couponController.ApplyCoupon);

// =================//shop page router=====================
// router.get('/shop',productController.shopPageLoad)
router.get("/shop", productController.queryTester);
// router.get('/shop/search',productController.shopPageSearch)
// router.get('/shop/search',productController.queryTester)

// =================//wallet page router==================
router.get("/wallet", auth.isLogin, walletController.walletPageLoader);

// test case
router.get("/test", productController.queryTester);

module.exports = router;
