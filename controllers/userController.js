const User = require("../models/userModel").User;
const ProductDB = require("../models/productsModel").product;
const CartDB = require("../models/userModel").Cart;
const addressDB = require("../models/userModel").UserAddress;
const OrderDB = require("../models/orderModel").Order;
const bcrypt = require("bcrypt");
const nodemiler = require("nodemailer");
require("dotenv").config();
let otp = null;

// This Function Used to Encrypt Password to hash format to store DataBase
// ---------------------------------------
const passwordEncrypt = async (password) => {
  try {
    let hashedPass = await bcrypt.hash(password, 10);
    return hashedPass;
  } catch (error) {
    console.log(error.message);
  }
};

const daliveryDateCalculate = async (dateValue) => {
  try {
    // Get the current date
    const currentDate = dateValue;

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

// This function used to Create 6 Digit OTP number
// ---------------------------------------
const generateOTP = (length = 6) => {
  return [...new Array(length)].reduce(function (a) {
    return a + Math.floor(Math.random() * 10);
  }, "");
};

// This used to Send Email OTP
// ---------------------------------------
const sentVerifyMail = async (name, email, userId) => {
  try {
    otp = generateOTP();
    const transporter = nodemiler.createTransport({
      host: process.env.otp_host,
      port: process.env.mailPort,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.mailUser,
        pass: process.env.Mail_key,
      },
    });
    const mailOptions = {
      from: process.env.mailUser,
      to: email,
      subject: "For veryfication email",
      html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
              <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Specsy</a>
              </div>
              <p style="font-size:1.1em">Hi, ${name}</p>
              <p>Thank you for choosing Specsy frame store. Use the following OTP to complete your Sign Up procedures. OTP is valid for 2 minutes</p>
              <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
              <p style="font-size:0.9em;">Regards,<br />Specsy</p>
              <hr style="border:none;border-top:1px solid #eee" />
              <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                <p>Project by Arshad</p>
              </div>
            </div>
          </div>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email ented ", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

// user forgetPassword manage verify send Email
// -------------------------------------------------
const sentVerifyMailForForgetPass = async (name, email) => {
  try {
    otp = generateOTP();
    const transporter = nodemiler.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "miraclexweb@gmail.com",
        pass: process.env.Mail_key,
      },
    });
    const mailOptions = {
      from: "miraclexweb@gmail.com",
      to: email,
      subject: "For veryfication email",
      html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
              <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Specsy</a>
              </div>
              <p style="font-size:1.1em">Hi, ${name}</p>
              <p>Forgot your password?</p>
              <p>We received a request to reset the password for your account.</p>
              <p>Use the following OTP to complete your reset password. OTP is valid for 2 minutes</p>
              <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
              <p style="font-size:0.9em;">Regards,<br />Specsy</p>
              <hr style="border:none;border-top:1px solid #eee" />
              <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                <p>Project by Arshad</p>
              </div>
            </div>
          </div>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email ented ", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

// Home page load..
// ---------------------------------------
const homePageLoad = async (req, res) => {
  try {
    let product = await ProductDB.find({});
    res.render("home", {
      user: req.session.user_id,
      products: product,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// signup Page Loading
// ---------------------------------------
const loadSignup = async (req, res) => {
  try {
    res.render(
      "signup",
      {
        user: false,
        emailExistErr: req.session.emailExistErr,
        userNameExistErr: req.session.userNameExistErr,
      },
      (err, html) => {
        if (!err) {
          // Set session variables to false after rendering
          req.session.emailExistErr = false;
          req.session.userNameExistErr = false;

          res.send(html); // Send the rendered HTML to the client
        } else {
          console.log(err.message);
        }
      }
    );
  } catch (error) {
    res.send(error.message);
  }
};

// login page loading handll
// ---------------------------------
const loginPageLoad = async (req, res) => {
  try {
    res.render(
      "login",
      {
        loginErr: req.session.loginErr,
        user: false,
        verifyErr: req.session.verifyErr,
        blockErr: req.session.blockErr,
        verifyId: req.session.verifyErr ? req.session.verifyId : 0,
        updatePass: req.session.updatePass,
      },
      (err, html) => {
        if (!err) {
          req.session.loginErr = false; // Set loginErr to false after rendering
          req.session.verifyErr = false;
          req.session.blockErr = false;
          req.session.verifyId = 0;
          req.session.updatePass = 0;

          res.send(html); // Send the rendered HTML to the client
        } else {
          console.log(err.message);
        }
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};

// login function handille here...
// ---------------------------------

const doLogin = async (req, res) => {
  try {
    let user = await User.findOne({ userName: req.body.userName });

    if (user) {
      let verified = user.verified === 1 ? true : false;
      let blockStatus = user.block === 0 ? false : true;

      bcrypt.compare(req.body.password, user.password).then((status) => {
        if (status) {
          if (verified === false) {
            req.session.verifyErr = 1;
            req.session.verifyId = user._id;
            console.log("veryfy Error");
            return res.redirect("/login");
          } else if (blockStatus) {
            req.session.blockErr = 1;
            console.log("block Error");
            return res.redirect("/login");
          } else {
            console.log("login success");
            req.session.loggedIn = true;
            req.session.user_id = user._id;
            return res.redirect("/");
          }
        } else {
          req.session.loginErr = 1;
          return res.redirect("/login");
          console.log("login failed");
        }
      });

      //    when user not alive else case
    } else {
      req.session.loginErr = 1;
      console.log("login failed");
      return res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// logout function handlling here..
// ---------------------------------

const doLogout = async (req, res) => {
  try {
    req.session.user_id = null;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

// when tha user signup data added functions handille here..
// ---------------------------------

const inserUser = async (req, res) => {
  try {
    User.findOne({ email: req.body.email }).then((mail) => {
      if (mail) {
        // email exist
        req.session.emailExistErr = 1;
        res.redirect("/signup");
      } else {
        User.findOne({ userName: req.body.userName }).then(async (exUser) => {
          if (exUser) {
            // username not available
            req.session.userNameExistErr = 1;
            res.redirect("/signup");
          } else {
            let currentDate = new Date();
            let SecurePassword = await passwordEncrypt(req.body.password);
            const user = new User({
              userName: req.body.userName,
              fullName: req.body.fullName,
              email: req.body.email,
              password: SecurePassword,
              verified: 0,
              accountOpenAt: currentDate.toLocaleString(),
              block: 0,
            });
            const result = await user.save();
            let otpVerify = await sentVerifyMail(
              req.body.userName,
              req.body.email,
              result._id
            );
            res.render("otpValid", {
              userId: result._id,
              email: result.email,
              forget: 0,
            });
          }
        });
      }
    });
  } catch (error) {
    res.send(error.message);
  }
};

// OTP entering page load :get
// ---------------------------------

const optPageLoad = async (req, res) => {
  try {
    console.log("otpPage called");
    res.render("otpValid", { forget: 0 });
  } catch (error) {
    console.log(error.message);
  }
};

// OTp reVerification  Handille here..
// ---------------------------------

const reVerifyUser = async (req, res) => {
  try {
    let userData = await takeUserData(req.query.id);
    let otpVerify = await sentVerifyMail(
      userData.userName,
      userData.email,
      userData._id
    );
    res.render("otpValid", {
      userId: userData.id,
      email: userData.email,
      forget: 0,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// otp validation process functions handille here..
// ---------------------------------

const otpValid = async (req, res) => {
  try {
    console.log(req.query.id);
    let num = req.body;
    if (req.query.userId) {
      console.log("expire called....");
      res.render("verifyNotfy", { wrong: 1, userId: req.query.userId });
      console.log("otp expired..");
    } else if (req.query.forget) {
      console.log("expire called....");
      res.render("verifyNotfy", { wrong: 3, userId: 0 });
      console.log("otp expired..");
    } else {
      enterdOtp = "" + num.a + num.b + num.c + num.d + num.e + num.f;
      if (enterdOtp == otp) {
        console.log("otp correct");
        let updatInfo = await User.updateOne(
          { _id: req.query.id },
          { $set: { verified: 1 } }
        );
        console.log(updatInfo);
        req.session.loggedIn = true;
        req.session.user_id = req.query.id;
        res.render("verifyNotfy", { wrong: 0 });
      } else {
        res.render("verifyNotfy", { userId: req.query.id, wrong: 2 });
        console.log("otp wrong");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// user Profile page load function
// ---------------------------------

const profilePageLoad = async (req, res) => {
  try {
    const userData = await takeUserData(req.session.user_id);
    res.render(
      "userProfile",
      {
        user: userData,
        updatePassErr: req.session.updatePassErr,
        updatePass: req.session.updatePass,
      },
      (err, html) => {
        if (!err) {
          // Reset session variables after rendering
          req.session.updatePassErr = false;
          req.session.updatePass = false;
          res.send(html);
        } else {
          console.log(err.message);
          // Handle rendering error here, if necessary
          res.status(500).send("Internal Server Error");
        }
      }
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const verifyPageLoad = async (req, res) => {
  try {
    res.render("verifyNotfy");
  } catch (error) {
    console.log(error.message);
  }
};

// this function use to collect user Data
// -----------------------------------------
const takeUserData = async (userId) => {
  try {
    return new Promise((resolve, reject) => {
      User.findOne({ _id: userId }).then((response) => {
        resolve(response);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

//this use to update user Profile avatar Photo
const updatePhoto = async (req, res) => {
  try {
    let updatePhoto = await User.updateOne(
      { _id: req.session.user_id },
      { $set: { image: req.file.filename } }
    );
    console.log(updatePhoto);
    userData = await takeUserData(req.session.user_id);
    // res.render("userProfile", { user: userData });
    res.render(
      "userProfile",
      {
        user: userData,
        updatePassErr: req.session.updatePassErr,
        updatePass: req.session.updatePass,
      },
      (err, html) => {
        if (!err) {
          // Reset session variables after rendering
          req.session.updatePassErr = false;
          req.session.updatePass = false;
          res.send(html);
        } else {
          console.log(err.message);
          // Handle rendering error here, if necessary
          res.status(500).send("Internal Server Error");
        }
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};

// this function used to edit user data handlling
// -----------------------------------------

const updateUserData = async (req, res) => {
  try {
    let userData = req.body;
    console.log(userData);
    console.log(req.session.user_id);
    let updateUser = await User.updateOne(
      { _id: req.session.user_id },
      {
        $set: {
          userName: userData.userName,
          fullName: userData.fullName,
          email: userData.email,
          "address.shippingAddress": userData.shippingAddress,
          "address.state": userData.state,
          "address.pincode": userData.pincode,
        },
      }
    );
    console.log(updateUser);
    userData = await takeUserData(req.session.user_id);
    // res.render("userProfile", { user: userData });
    res.render(
      "userProfile",
      {
        user: userData,
        updatePassErr: req.session.updatePassErr,
        updatePass: req.session.updatePass,
      },
      (err, html) => {
        if (!err) {
          // Reset session variables after rendering
          req.session.updatePassErr = false;
          req.session.updatePass = false;
          res.send(html);
        } else {
          console.log(err.message);
          // Handle rendering error here, if necessary
          res.status(500).send("Internal Server Error");
        }
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};

//password changeing from user profile
// ------------------------------------
const changepassword = async (req, res) => {
  try {
    console.log(req.body.newPassword);
    let userDetails = await User.findOne({ _id: req.session.user_id });
    bcrypt
      .compare(req.body.oldPassword, userDetails.password)
      .then(async (status) => {
        if (status) {
          let newSecurePassword = await bcrypt.hash(req.body.newPassword, 10);
          let change = await User.updateOne(
            { _id: userDetails._id },
            { $set: { password: newSecurePassword } }
          );
          console.log(change);
          req.session.updatePass = 1;
          res.redirect("/profile");
          console.log("password changed...");
        } else {
          console.log("wrong old password");
          req.session.updatePassErr = 1;
          res.redirect("/profile");
        }
      });
  } catch (error) {
    console.log(error.message);
  }
};

// cart page load and pass the Datas
// -------------------------------
const cartPageLoad = async (req, res) => {
  try {
    const userData = await takeUserData(req.session.user_id);
    const cartDetails = await CartDB.findOne({ user: req.session.user_id })
      .populate({
        path: "products.product",
        select: "product_name price frame_shape images.image1",
      })
      .exec();

    // console.log(cartDetails.products[0].product.product_name);
    if (cartDetails) {
      // console.log(cartDetails.products);

      let total = await calculateTotalPrice(req.session.user_id);
      // console.log("total price : " + total);
      return res.render("cart", {
        user: userData,
        cartItems: cartDetails,
        total,
      });
    } else {
      return res.render("cart", { user: userData, cartItems: 0, total: 0 });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// add cart ajax call handel here...
// -----------------------------
const addtoCart = async (req, res) => {
  try {
    console.log(req.body.id);
    console.log(req.body.user);
    const existingCart = await CartDB.findOne({ user: req.body.user });
    console.log(existingCart);
    if (!existingCart) {
      const cart = new CartDB({
        user: req.body.user,
        products: [
          {
            product: req.body.id,
            quantity: 1,
          },
        ],
      });

      let result = await cart.save();
      console.log(result);
      decreaseStock(req.body.id,1)
      res.json({ cart: 1 });
    } else {
      const productInCart = existingCart.products.find(
        (item) => item.product.toString() === req.body.id.toString()
      );

      if (productInCart) {
        res.json({ cart: 2 });
      } else {
        existingCart.products.push({
          product: req.body.id,
          quantity: 1,
        });
        decreaseStock(req.body.id,1)
        res.json({ cart: 1 });
      }
      const result = await existingCart.save();
      console.log("Product added to cart:", result);
    }

    res.json();
    console.log(result);
  } catch (error) {
    console.log(error.message);
  }
};

// cart items price calculate function here useing wity Quantity
// ----------------------------------------------------------------
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

//change product Quantity from cart page handille here...
// ------------------------------------------------------------

const changeProductQuantity = async (userId, productId, newQuantityChange) => {
  try {
    // Find the user's cart based on the user's ID
    const cart = await CartDB.findOne({ user: userId });
    console.log(cart);

    if (!cart) {
      console.log("User does not have a cart.");
      return;
    }

    // Locate the specific product within the cart by its ID
    const productInCart = cart.products.find(
      (cartProduct) => cartProduct.product.toString() === productId.toString()
    );

    if (!productInCart) {
      console.log("Product not found in the cart.");
      return;
    }

    const currentQuantity = productInCart.quantity;

    const newQuantity = currentQuantity + newQuantityChange;

    if (newQuantity < 1) {
      console.log("Quantity cannot be less than 1.");
      return;
    }
    if (newQuantity > 5) {
      console.log("Quantity cannot be greater than 5.");
      return;
    }

    if(newQuantity==1){
      increaseStock(productId,1)
    }else{
      decreaseStock(productId,1)
    }
    productInCart.quantity = newQuantity;

    // Save the updated cart back to the database
    let result = await cart.save();
    console.log("Product quantity updated successfully.");
    return result;
  } catch (error) {
    console.error("Error updating product quantity:", error.message);
  }
};

// cart product qty changing and handill function
// -----------------------------------------

const productQuantityHandlling = async (req, res) => {
  try {
    if (!req.session.user_id) {
      res.json({ user: 0 });
    } else {
      let { userId, productId, qty } = req.body;
      // console.log(userId,productId,qty);
      qty = Number(qty);
      console.log(qty);
      let qtyChange = await changeProductQuantity(userId, productId, qty);
      // console.log(qtyChange);

      const cartDetails = await CartDB.findOne({ user: userId });
      // const userData = await takeUserData(userId);
      let total = await calculateTotalPrice(userId);
      res.json({ cartItems: cartDetails, total });
    }
    // console.log(qtyChange);
  } catch (error) {
    console.log(error.message);
  }
};

// remove cart item
// ------------------------
const removeCartItem = async (req, res) => {
  try {
    const { user, product, qty } = req.body;
    const cart = await CartDB.findOne({ user: user });
    // console.log(cart);
    const qtyFind = cart.products.find(item => item.product.toString() == product.toString())
    await increaseStock(product,qtyFind.quantity)
    // console.log(qtyFind.quantity);

    cart.products = cart.products.filter(
      (cartProduct) => cartProduct.product.toString() !== product.toString()
    );
    let remove = await cart.save();
    console.log(remove);
    console.log("Porduct removed");
    res.json({ remove: 1 });
  } catch (error) {
    console.log(error.message);
  }
};

// forgetpassword
// ------------------
const forgetpasswordPageLoad = async (req, res) => {
  try {
    res.render("forgotpass", { wrong: 0 });
  } catch (error) {
    console.log(error.message);
  }
};

// manage forgetpassword
// -------------------------
const manageForgetPassword = async (req, res) => {
  try {
    console.log(req.body.email);
    let existUser = await User.findOne({ email: req.body.email });
    if (existUser) {
      console.log(existUser.userName);
      let sendMail = await sentVerifyMailForForgetPass(
        existUser.userName,
        existUser.email
      );
      console.log(sendMail);
      res.render("otpValid", {
        forget: 1,
        userId: existUser._id,
        email: existUser.email,
      });
    } else {
      console.log("This Email not exist");
      res.render("forgotpass", { wrong: 1 });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgetOTPpageLoad = async (req, res) => {
  try {
    // console.log(req.body);
    num = req.body;
    enterdOtp = "" + num.a + num.b + num.c + num.d + num.e + num.f;
    if (otp == enterdOtp) {
      console.log("otp is correct");
      res.render("newpassword", { userId: req.query.id });
    } else {
      console.log("otp is incorrect");
      res.render("verifyNotfy", { userId: 0, wrong: 2.5 });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// set new user passs
// ------------------
const createNewpassword = async (req, res) => {
  try {
    console.log(req.body.password);
    let SecurePassword = await bcrypt.hash(req.body.password, 10);
    let updatePass = await User.updateOne(
      { _id: req.query.id },
      { $set: { password: SecurePassword } }
    );
    console.log(updatePass);
    req.session.updatePass = 1;
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

// insert user shipping address
// ------------------------------------
const addShippingAddress = async (req, res) => {
  try {
    let addrData = req.body;
    let userAddress = await addressDB.findOne({ userId: req.session.user_id });
    if (!userAddress) {
      userAddress = new addressDB({
        userId: req.session.user_id,
        addresses: [
          {
            country: addrData.country,
            fullName: addrData.fullName,
            mobileNumber: addrData.mobileNumber,
            city: addrData.city,
            state: addrData.state,
            pincode: addrData.pincode,
          },
        ],
      });
    } else {
      // If the user's address document already exists, add a new address to the array
      userAddress.addresses.push({
        country: addrData.country,
        fullName: addrData.fullName,
        mobileNumber: addrData.mobileNumber,
        city: addrData.city,
        state: addrData.state,
        pincode: addrData.pincode,
      });
    }

    // Save the updated userAddress document
    let result = await userAddress.save();
    // let addr = req.body;
    // const address = new addressDB({
    //   userId:req.session.user_id,
    //   country: addr.country,
    //   fullName: addr.fullName,
    //   mobileNumber: addr.mobileNumber,
    //   city: addr.city,
    //   state: addr.state,
    //   pincode: addr.pincode,
    // });
    // let result  = await address.save()
    // console.log(result);
    let total = await calculateTotalPrice(req.session.user_id);
    // res.render("checkout", { user: req.session.user_id, total });
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
  }
};

// all orders page load
// ---------------------------
const allOrdersPageLoad = async (req, res) => {
  try {
    // testing++++++++++++++++==============
    const userId = req.session.user_id;

    // Find all orders for the user based on their user ID
    const userOrders = await OrderDB.find({ userId: userId });

    if (userOrders.length === 0) {
      console.log("No orders found for the user.");
      return res.render("allorders", { user: userId, products: false });
    }

    // Create an array to hold product-wise order details
    const productWiseOrders = [];

    // Iterate through each order
    for (const order of userOrders) {
      // Iterate through each product in the order
      for (const product of order.products) {
        const productId = product.productId;
        const quantity = product.quantity;
        const placeDate = formatDate(order.orderDate);
        const OrderStatus = product.OrderStatus;
        const StatusLevel = product.StatusLevel;

        // Retrieve additional product details using the productId
        const productDetails = await ProductDB.findById(productId, {
          images: 1,
          product_name: 1,
          frame_shape: 1,
          price: 1,
        });

        // Retrieve the address associated with the order
        let DeliveryexpectedDate = await daliveryDateCalculate(order.orderDate);
        // Create a product-wise order data object
        const productWiseOrder = {
          orderId: order._id,
          placeOrderDate: placeDate,
          paymentMethod: order.paymentMethod,
          productDetails, // Contains the product's details
          quantity,
          address: order.shippingAddress,
          deliveryDate: DeliveryexpectedDate,
          OrderStatus,
          StatusLevel
        };

        // Push the product-wise order data into the productWiseOrders array
        productWiseOrders.push(productWiseOrder);
      }
    }
    //  testing END+++++++++====================
    console.log(productWiseOrders);
    console.log(productWiseOrders);
    res.render("allorders", {
      user: req.session.user_id,
      products: productWiseOrders,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// load user address on profile
// ================================
const loadShippingAddressPage = async (req, res) => {
  try {
    let userAddress = await addressDB.findOne({ userId: req.session.user_id });
    // console.log(userAddress);
    if(!userAddress){
      res.render("address", {
        user: req.session.user_id,
        address: 0,
      });
    }else{
      res.render("address", {
        user: req.session.user_id,
        address: userAddress.addresses,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// this used to add shipping address from user profile
// -----------------------------------------------------------
const addShippingAddressFromProfile = async (req, res) => {
  try {
    let addrData = req.body;
    let userAddress = await addressDB.findOne({ userId: req.session.user_id });
    if (!userAddress) {
      userAddress = new addressDB({
        userId: req.session.user_id,
        addresses: [
          {
            country: addrData.country,
            fullName: addrData.fullName,
            mobileNumber: addrData.mobileNumber,
            city: addrData.city,
            state: addrData.state,
            pincode: addrData.pincode,
          },
        ],
      });
    } else {
      // If the user's address document already exists, add a new address to the array
      userAddress.addresses.push({
        country: addrData.country,
        fullName: addrData.fullName,
        mobileNumber: addrData.mobileNumber,
        city: addrData.city,
        state: addrData.state,
        pincode: addrData.pincode,
      });
    }
    console.log(req.body);
    let result = await userAddress.save();
    res.redirect("/profile/user_address");
  } catch (error) {
    console.log(error.message);
  }
};

// update user shipping Adrress from profile area
// -------------------------------------------------
const updateShippingAddress = async (req, res) => {
  try {
    // console.log(req.body);
    let Addres = req.body;
    let userAddress = await addressDB.findOne({ userId: req.session.user_id });
    const selectedAddress = userAddress.addresses.find(
      (address) => address.id === req.body.adressId
    );

    selectedAddress.country = Addres.country;
    selectedAddress.fullName = Addres.fullName;
    selectedAddress.mobileNumber = Addres.mobileNumber;
    selectedAddress.pincode = Addres.pincode;
    selectedAddress.city = Addres.city;
    selectedAddress.state = Addres.state;
    await userAddress.save();

    res.redirect("/profile/user_address");
    // console.log(selectedAddress);
  } catch (error) {
    console.log(error.message);
  }
};

const deleteShippingAddress = async (req, res) => {
  try {
    console.log(req.body.id);
    let userAddress = await addressDB.findOne({ userId: req.session.user_id });
    const addressToDeleteIndex = userAddress.addresses.findIndex(
      (address) => address.id === req.body.id
    );
    if (addressToDeleteIndex === -1) {
      return res.status(404).json({ remove: 0 });
    }
    userAddress.addresses.splice(addressToDeleteIndex, 1);
    await userAddress.save();
    return res.json({ remove: 1 });
  } catch (error) {
    console.log(error.message);
  }
};





// +++++++++++++++++++++++++++++++
// for testing purpose
// ----------------------------

const testLoad = async (req, res) => {
  try {
    res.render("wishlist", { user: 0 });
  } catch (error) {
    console.log(error.message);
  }
};



//decrease the product stock
// ----------------------------
const decreaseStock = async(productId, quantity)=>{
  try {
    const product = await ProductDB.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    if (product.stock < quantity) {
      throw new Error('Not enough stock available');
    }
    product.stock -= quantity;
    const result = await product.save();
    return result;
  } catch (error) {
    console.log(error.message);
  }
}

//increase the product stock
// --------------------------------
const increaseStock = async(productId, quantity)=>{
  try {
    const product = await ProductDB.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    product.stock += quantity;
    const result = await product.save();
    return result;
  } catch (error) {
    console.log(error.message);
  }
}




// ===============================
// exporting
// ---------------------------
module.exports = {
  inserUser,
  loadSignup,
  loginPageLoad,
  homePageLoad,
  optPageLoad,
  otpValid,
  doLogin,
  doLogout,
  profilePageLoad,
  verifyPageLoad,
  reVerifyUser,
  updateUserData,
  updatePhoto,
  changepassword,
  cartPageLoad,
  addtoCart,
  productQuantityHandlling,
  removeCartItem,
  forgetpasswordPageLoad,
  manageForgetPassword,
  forgetOTPpageLoad,
  createNewpassword,
  addShippingAddress,
  testLoad,
  allOrdersPageLoad,
  loadShippingAddressPage,
  addShippingAddressFromProfile,
  updateShippingAddress,
  deleteShippingAddress,
};



