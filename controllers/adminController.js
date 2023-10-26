const UserDB = require("../models/userModel").User;
const AdminDB = require("../models/adminModel");
const ProductDB = require("../models/productsModel").product;
const CategoryDB = require("../models/productsModel").category;
const OrderDB = require("../models/orderModel").Order;
const PaymentDB = require("../models/paymentModel");
const AnalyticsDB = require("../models/analyticModel");
const XLSX = require("xlsx");
const ExcelJS = require("exceljs");

const path = require("path");
const bcrypt = require("bcrypt");

// admin home page loading function
// ---------------------------------------
const adminPageLoad = async (req, res) => {
  try {
    let users = await getAlluserData();
    // console.log(users);
    const TransactionHistory = await PaymentDB.find();
    const countOfCod = await PaymentDB.countDocuments({
      paymentMethod: "Cash on Delivery",
    });
    const countOfOnline = await PaymentDB.countDocuments({
      paymentMethod: "Online",
    });
    const paymentChart = { countOfCod, countOfOnline };
    // console.log(TransactionHistory);
    const orders = await recentOrder();
    console.log(orders);
    // let result = await generateReport("daily");
    // console.log(result);
    const stock = await getTotalStockNumber();
    const analaticalData = await AnalyticsDB.find();
    const report = {
      stock,
      sales: analaticalData[0].totalOrders,
      amount: analaticalData[0].totalSalesAmount,
    };
    console.log(report);
    res.render("dashbord", {
      users: users,
      paymentHistory: TransactionHistory,
      orders,
      paymentChart,
      report,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// recent orders
// =================
const recentOrder = async () => {
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
              paymentStatus: productInfo.paymentStatus,
              quantity: productInfo.quantity,
            },
          });
        }
      }
    }

    // for(i=0;i<productWiseOrdersArray.length;i++){
    // console.log(productWiseOrdersArray);
    return productWiseOrdersArray;
  } catch (error) {}
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

//order report maker
// ========================
const generateReport = async (dateRange) => {
  try {
    const currentDate = new Date();
    let startDate;
    let endDate = new Date();

    switch (dateRange) {
      case "daily":
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 1);
        startDate.setHours(24, 0, 0, 0);
        break;
      case "weekly":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "yearly":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        break;
    }

    // Retrieve orders within the specified date range
    const orders = await OrderDB.find({
      orderDate: { $gte: startDate, $lte: endDate },
    });

    // if (orders.length === 0) {
    //   console.log(`No orders found for the ${dateRange} report.`);
    //   return;
    // }

    const totalSalesAmount = calculateTotalSalesAmount(orders);
    const totalOrders = orders.length;

    const report = {
      reportDate: endDate,
      totalSalesAmount,
      totalOrders,
    };

    console.log(`Generated ${dateRange} report for ${endDate}`);
    return report;
  } catch (error) {
    console.log(error.message);
  }
};

function calculateTotalSalesAmount(orders) {
  return orders.reduce((total, order) => total + order.totalAmount, 0);
}


//reports filltering request
// ----------------------------
const genarateSalesReports = async (req, res) => {
  try {
    const date = Date.now();    
    const report = await generateReport(req.body.data);
    const reportData = [
      {
        reportDate: report.reportDate,
        totalSalesAmount: report.totalSalesAmount,
        totalOrders: report.totalOrders,
      },
    ];

    const fileName = `salesReport-${date}.xlsx`; // Provide the desired file name

    const exel = await generateExcelReport(reportData,fileName);
    res.status(200).json({report,fileName});
    // res.json(report,exel);
  } catch (error) {
    console.log(error.message);
  }
};

//const get Total Stock  number
// -----------------------------
const getTotalStockNumber = async () => {
  try {
    const result = await ProductDB.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stock" },
        },
      },
    ]);
    const totalStock = result.length > 0 ? result[0].totalStock : 0;
    // console.log(totalStock);
    return totalStock;
  } catch (error) {
    console.log(error.message);
  }
};

//genarate exel sheet report
// -------------------------------
const generateExcelReport = async (reportData, fileName) => {
   const filePath = path.join(__dirname,"../public/admin/reports/",fileName);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('SalesReport');

  // Define the columns for the worksheet
  worksheet.columns = [
    { header: 'Report Date', key: 'reportDate' },
    { header: 'Total Sales Amount', key: 'totalSalesAmount' },
    { header: 'Total Orders', key: 'totalOrders' },
  ];

  // Add data to the worksheet
  reportData.forEach((item) => {
    worksheet.addRow(item);
  });



  await workbook.xlsx.writeFile(filePath);
  console.log('Excel report created at:', filePath);
  return filePath; 
};


// Usage
// const reportData = [
//   {
//     reportDate: '2023-10-23',
//     totalSalesAmount: 1000.0,
//     totalOrders: 50,
//   },
//   // Add more data as needed
// ];

// const filePath = 'salesReport.xlsx'; // Provide the desired file path

// generateExcelReport(reportData, filePath);

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
  adminLogOut,
  genarateSalesReports,
};
