const UserDB = require("../models/userModel").User;
const AdminDB = require("../models/adminModel");
const ProductDB = require("../models/productsModel").product;
const CategoryDB = require("../models/productsModel").category;
const OrderDB = require("../models/orderModel").Order;
const path = require("path");
const bcrypt = require("bcrypt");

// admin home page loading function
// ---------------------------------------
const adminPageLoad = async (req, res) => {
  try {
    let users = await getAlluserData();
    // console.log(users);
    res.render("dashbord", { users: users });
  } catch (error) {
    console.log(error.message);
  }
};

//users page loading function
// ----------------------------------------------------------------
const usersPageLoad = async (req, res) => {
  try {
    let users = await getAlluserData();
    // console.log(users);
    res.render("users", { users: users });
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

// This used to Take a single product Data useing Product Id
// ---------------------------------------
const getProductDetails = async (id) => {
  try {
    let product = await ProductDB.find({ _id: id });
    return product[0];
  } catch (error) {
    console.log(error.message);
  }
};

// This used to Block user , this function working with Ajax
// ---------------------------------------

const userBlock = async (req, res) => {
  try {
    let blockStatus = await UserDB.findOne({ _id: req.body.id });
    // console.log(blockStatus.block);
    if (blockStatus.block === 0) {
      let block = await UserDB.updateOne(
        { _id: req.body.id },
        { $set: { block: 1 } }
      );
    } else {
      let block = await UserDB.updateOne(
        { _id: req.body.id },
        { $set: { block: 0 } }
      );
    }

    let users = await getAlluserData();
    res.json({ users: users });
  } catch (error) {
    console.log(error.message);
  }
};

// This used to User edit page Load to Frendend
// ---------------------------------------
const editUserPageLoad = async (req, res) => {
  try {
    // console.log(req.query.id);
    let userDetails = await takeOneUserData(req.query.id);
    console.log(userDetails);
    res.render("editUser", { user: userDetails });
  } catch (error) {
    console.log(error.message);
  }
};

// This Function help to get Single User data with matching User Id
// ---------------------------------------
const takeOneUserData = async (userId) => {
  try {
    let userDetails = await UserDB.find({ _id: userId });
    return userDetails;
  } catch (error) {
    console.log(error.message);
  }
};

// This function Handille user data Updating
// ---------------------------------------
const updateUserData = async (req, res) => {
  try {
    let userData = req.body;
    let updateUser = await UserDB.updateOne(
      { _id: req.query.id },
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
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error.message);
  }
};

// This function used to working Search process for users, return searched users
// ---------------------------------------
const searchUsersByKey = async (key) => {
  try {
    let userDetails = await UserDB.find({
      $or: [
        { userName: { $regex: key } },
        { fullName: { $regex: key } },
        { email: { $regex: key } },
      ],
    });

    return userDetails;
  } catch (error) {
    console.log(error.message);
  }
};


// handdille search users
// ---------------------------------------
const searchUsers = async (req, res) => {
  try {
    console.log(req.query.key);
    let users = await searchUsersByKey(req.query.key);
    res.render("users", { users: users });
  } catch (error) {
    console.log(error.message);
  }
};

// Admin login page loading
// ---------------------------------------
const loginPageLoad = async (req, res) => {
  try {
    res.render(
      "login",
      {
        adminloginErr: req.session.adminloginErr,
      },
      (err, html) => {
        if (!err) {
          // Set adminloginErr to false after rendering
          req.session.adminloginErr = false;

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



// Admin login handilling
// ---------------------------------------
const doLogin = async (req, res) => {
  try {
    let admin = await AdminDB.findOne({ userName: req.body.userName });
    // console.log(req.body.password);
    // console.log(admin);

    if (admin) {
      bcrypt.compare(req.body.password, admin.password).then((status) => {
        if (status) {
          console.log("login sucess");
          req.session.adminloggedIn = true;
          req.session.admin_id = admin._id;
          res.redirect("/admin");
        } else {
          console.log("login fail");
          req.session.adminloginErr = 1;
          res.redirect("/admin/login");
        }
      });
    } else {
      console.log("login failed");
      req.session.adminloginErr = 1;
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Admin Logout Function
// ---------------------------------------
const adminLogOut = async (req, res) => {
  try {
    req.session.adminloggedIn = false;
    req.session.admin_id = null;
    console.log("admin logouted...");
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error.message);
  }
};







// exportings
// =========================
module.exports = {
  adminPageLoad,
  usersPageLoad,
  userBlock,
  editUserPageLoad,
  updateUserData,
  searchUsers,
  loginPageLoad,
  doLogin,
  adminLogOut
};
