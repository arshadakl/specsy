const User = require("../models/userModel").User;
const ProductDB = require("../models/productsModel").product;
const CartDB = require("../models/userModel").Cart;
const bcrypt = require("bcrypt");
const nodemiler = require("nodemailer");
require("dotenv").config();
let otp = null;

const passwordEncrypt = async (password) => {
  try {
    let hashedPass = await bcrypt.hash(password, 10);
    return hashedPass;
  } catch (error) {
    console.log(error.message);
  }
};
// send mail
const generateOTP = (length = 6) => {
  return [...new Array(length)].reduce(function (a) {
    return a + Math.floor(Math.random() * 10);
  }, "");
};

// send mail
const sentVerifyMail = async (name, email, userId) => {
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

// const loginPageLoad = async (req,res)=>{
//     try {
//         let user = req.session.user
//         user ? res.redirect('/') :
//         req.session.loginErr ? console.log("login error und") : null
//         res.render('login',{
//             loginErr:req.session.loginErr
//         })
//         req.session.loginErr=false
//     } catch (error) {
//         console.log(error.message);
//     }
// }

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
      },
      (err, html) => {
        if (!err) {
          req.session.loginErr = false; // Set loginErr to false after rendering
          req.session.verifyErr = false;
          req.session.blockErr = false;
          req.session.verifyId = 0;
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

const doLogin = async (req, res) => {
  try {
    let user = await User.findOne({ userName: req.body.userName });
    // if(user){
    //     let verified = user.verified===0 ? true : false
    //     let blockStatus = user.block===0 ? false : true
    // }
    // console.log(user);
    if (user) {
      let verified = user.verified === 1 ? true : false;
      let blockStatus = user.block === 0 ? false : true;

      bcrypt.compare(req.body.password, user.password).then((status) => {
        if (status) {
          if (verified === false) {
            req.session.verifyErr = 1;
            req.session.verifyId = user._id;
            console.log("veryfy Error");
            res.redirect("/login");
          } else if (blockStatus) {
            req.session.blockErr = 1;
            console.log("block Error");
            res.redirect("/login");
          } else {
            console.log("login success");
            req.session.loggedIn = true;
            req.session.user_id = user._id;
            res.redirect("/");
          }
        } else {
          req.session.loginErr = 1;
          res.redirect("/login");
          console.log("login failed");
        }
      });

      //    when user not alive else case
    } else {
      req.session.loginErr = 1;
      console.log("login failed");
      res.redirect("/login");
    }
    //
    // if(user){
    //     bcrypt.compare(req.body.password,user.password).then((status)=>{
    //         if(status){
    //             console.log("login success");
    //             req.session.loggedIn = true;
    //             req.session.user_id=user._id
    //             res.redirect('/')

    //         }else{
    //             req.session.loginErr = 1;
    //             res.redirect("/login");
    //             console.log("login failed");
    //         }
    //     })
    // }else{
    //     req.session.loginErr = 1;
    //     console.log("login failed");
    //     res.redirect("/login");
    // }
  } catch (error) {
    console.log(error.message);
  }
};

const doLogout = async (req, res) => {
  try {
    req.session.user_id = null;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

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
            res.render("otpValid", { userId: result._id, email: result.email });
          }
        });
      }
    });
    // let currentDate = new Date();
    // let SecurePassword = await passwordEncrypt(req.body.password);
    // const user = new User({
    //   userName: req.body.userName,
    //   fullName: req.body.fullName,
    //   email: req.body.email,
    //   password: SecurePassword,
    //   verified: 0,
    //   accountOpenAt: currentDate.toLocaleString(),
    //   block: 0,
    // });
    // const result = await user.save();
    // let otpVerify = await sentVerifyMail(
    //   req.body.userName,
    //   req.body.email,
    //   result._id
    // );
    // res.render("otpValid", { userId: result._id, email: result.email });
  } catch (error) {
    res.send(error.message);
  }
};

// const productPageLoad = async(req,res)=>{
//     try {
//         res.render('product',{user:req.session.user_id})
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const optPageLoad = async (req, res) => {
  try {
    console.log("otpPage called");
    res.render("otpValid");
  } catch (error) {
    console.log(error.message);
  }
};

const reVerifyUser = async (req, res) => {
  try {
    let userData = await takeUserData(req.query.id);
    let otpVerify = await sentVerifyMail(
      userData.userName,
      userData.email,
      userData._id
    );
    res.render("otpValid", { userId: userData.id, email: userData.email });
  } catch (error) {
    console.log(error.message);
  }
};

const otpValid = async (req, res) => {
  try {
    console.log(req.query.id);
    let num = req.body;
    if (req.query.userId) {
      console.log("expire called....");
      res.render("verifyNotfy", { wrong: 1, userId: req.query.userId });
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

// const profilePageLoad = async (req, res) => {
//   try {
//     userData = await takeUserData(req.session.user_id);
//     req.session.updatePassErr = 1
//     req.session.updatePass =
//     res.render("userProfile", {
//       user: userData ,
//       updatePassErr:req.session.updatePassErr,
//       updatePass:req.session.updatePass
//     },
//     (err,html)=>{
//       if(!err){
//         req.session.updatePassErr = false
//         req.session.updatePass = false
//         res.send(html);
//       }
//     }
//     )

//     // res.render("userProfile", { user: userData ,});
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const profilePageLoad = async (req, res) => {
  try {
    // Assuming 'takeUserData' is an asynchronous function
    const userData = await takeUserData(req.session.user_id);

    // Render the "userProfile" view with user data and session variables
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
    // Handle the error gracefully, e.g., send an error response
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
      console.log(cartDetails.products);

      let total = await calculateTotalPrice(req.session.user_id);
      console.log("total price : " + total);
      res.render("cart", { user: userData, cartItems: cartDetails, total });
    }else{
      res.render("cart", { user: userData, cartItems: 0, total:0 });
    }
    // console.log(cartDetails.products);

    // const userData = await takeUserData(req.session.user_id);
    // let total = await calculateTotalPrice(req.session.user_id);
    // console.log("total price : " + total);
    // res.render("cart", { user: userData, cartItems: cartDetails,total });
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
    } else {
      const productInCart = existingCart.products.find(
        (item) => item.product.toString() === req.body.id.toString()
      );

      if (productInCart) {
        // If the product is already in the cart, increase the quantity
        productInCart.quantity += 1;
      } else {
        existingCart.products.push({
          product: req.body.id,
          quantity: 1,
        });
      }
      const result = await existingCart.save();
      console.log("Product added to cart:", result);
    }

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

    // Debug: Print current values
    const currentQuantity = productInCart.quantity;
    // console.log('Current Quantity:', currentQuantity);
    // console.log('New Quantity Change:', newQuantityChange);

    // Calculate the new quantity based on the change
    const newQuantity = currentQuantity + newQuantityChange;

    // Debug: Print new quantity
    // console.log('New Quantity:', newQuantity);

    if (newQuantity < 1) {
      console.log("Quantity cannot be less than 1.");
      return;
    }
    if (newQuantity > 5) {
      console.log("Quantity cannot be greater than 5.");
      return;
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

// const changeProductQuantity = async (userId, productId, newQuantity) => {
//   try {
//     console.log("userId :"+userId);
//     console.log("productId :"+productId);
//     console.log("newQuantity :"+newQuantity);

//     // Find the user's cart based on the user's ID
//     const cart = await CartDB.findOne({ user: userId });

//     if (!cart) {
//       console.log('User does not have a cart.');
//       return;
//     }

//     // Locate the specific product within the cart by its ID
//     const productInCart = cart.products.find(
//       (cartProduct) => cartProduct.product.toString() === productId.toString()
//     );

//     if (!productInCart) {
//       console.log('Product not found in the cart.');
//       return;
//     }

//     // Update the quantity of the product
//     productInCart.quantity = newQuantity;

//     // Save the updated cart back to the database
//     let result = await cart.save();
//     console.log('Product quantity updated successfully.');
//     return result

//   } catch (error) {
//     console.error('Error updating product quantity:', error.message);
//   }
// };

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
const removeCartItem =async(req,res)=>{
  try {
    const {user,product} = req.body
    const cart = await CartDB.findOne({user:user})
    cart.products = cart.products.filter(
      (cartProduct) => cartProduct.product.toString() !== product.toString()
    );
    let remove = await cart.save()
    console.log(remove);
    console.log("Porduct removed");
    res.json({remove:1})
  } catch (error) {
    console.log(error.message);
  }
}


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
  removeCartItem
};
