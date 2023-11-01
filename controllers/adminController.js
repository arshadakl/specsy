const UserDB = require("../models/userModel").User;
const AdminDB = require("../models/adminModel");
const ProductDB = require("../models/productsModel").product;
const CategoryDB = require("../models/productsModel").category;
const OrderDB = require("../models/orderModel").Order;
const PaymentDB = require("../models/paymentModel").TransactionHistory;
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
    const stock = await getTotalStockNumber();
    const result = await createSalesReport("year")
    const report = {
      stock,
      sales: result.productProfits.length,
      amount: result.totalSales,
    };
    
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
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
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

    // Retrieve orders within the specified date range with products having "OrderStatus" of "Delivered"
    const orders = await OrderDB.find({
      orderDate: { $gte: startDate, $lte: endDate },
      "products.OrderStatus": "Delivered",
    });

    // Calculate the total sales profit based on "Delivered" products
    const totalSalesProfit = await calculateTotalProfit(orders);

    const totalOrders = orders.length;

    const report = {
      reportDate: endDate,
      totalSalesProfit,
      totalOrders,
    };

    console.log(`Generated ${dateRange} report for ${endDate}`);
    console.log(report);
    return report;
  } catch (error) {
    console.log(error.message);
  }
};

// const generateReport = async (dateRange) => {
//   try {
//     const currentDate = new Date();
//     let startDate;
//     let endDate = new Date();

//     switch (dateRange) {
//       case "daily":
//         startDate = new Date(currentDate);
//         startDate.setDate(currentDate.getDate() - 1);
//         startDate.setHours(24, 0, 0, 0);
//         break;
//       case "weekly":
//         startDate = new Date();
//         startDate.setDate(startDate.getDate() - 7);
//         break;
//       case "yearly":
//         startDate = new Date();
//         startDate.setFullYear(startDate.getFullYear() - 1);
//         break;
//       default:
//         break;
//     }

//     // Retrieve orders within the specified date range
//     const orders = await OrderDB.find({
//       orderDate: { $gte: startDate, $lte: endDate },
//     });


//     // const totalSalesAmount = calculateTotalSalesAmount(orders);
//     const totalSalesProfit = await calculateTotalProfit(orders);
//     const totalOrders = orders.length;

//     const report = {
//       reportDate: endDate,
//       totalSalesAmount:totalSalesProfit,
//       totalOrders,
//     };

//     console.log(`Generated ${dateRange} report for ${endDate}`);
//     return report;
//   } catch (error) {
//     console.log(error.message);
//   }
// };

async function calculateTotalProfit(orders) {
  let totalProfit = 0;

  for (const order of orders) {
    for (const productInfo of order.products) {
      if (productInfo.OrderStatus === 'Delivered') {
        const product = await ProductDB.findOne(productInfo.productId);
        // console.log(product);
        const productCost = (30 / 100) * product.price;
        const productRevenue = productInfo.quantity * product.price;
        const orderProductProfit = productRevenue - productCost;
        totalProfit += orderProductProfit;
      }
    }
  }

  return totalProfit;
}
// function calculateTotalProfit(orders) {
//   return orders.reduce(async(totalProfit, order) => {
//     const orderProductProfit = await order.products.reduce(async(orderTotalProfit, productInfo) => {
//       if (productInfo.OrderStatus === 'Delivered') {
//         // const product = productInfo.product;
//         const product = await ProductDB.findOne(productInfo.productId)
//         console.log(product);
//         const productCost = (30 / 100) * product.price; // Calculate the cost as 30% of product price
//         const productRevenue = productInfo.quantity * product.price;
//         const orderProductProfit = productRevenue - productCost;
//         return orderTotalProfit + orderProductProfit;
//       }
//       return orderTotalProfit;
//     }, 0);

//     return totalProfit + orderProductProfit;
//   }, 0);
// }


// function calculateTotalSalesAmount(orders) {
//   return orders.reduce((total, order) => total + order.totalAmount, 0);
// }


//reports filltering request
// ----------------------------
const genarateSalesReports = async (req, res) => {
  try {
    const date = Date.now();    
    // const report = await generateReport(req.body.data);
    const result = await createSalesReport(req.body.data)
    const report = {
        reportDate: date,
        totalSalesAmount: result.totalSales,
        totalOrders: result.productProfits.length,
      };
      // console.log(report);

    // const fileName = `salesReport-${date}.xlsx`; // Provide the desired file name

    // const exel = await generateExcelReport(reportData,fileName);
    res.status(200).json({report});
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


//sales report page load
// -------------------------------
// const salesReportPageLoad = async(req,res)=>{
//   try {
//     const sales = await createSalesReport("2023-10-01", "2023-10-31");
//     const WeeklySales = await generateWeeklySalesCount()
//     const SoldProducts = await getMostSellingProducts()
//     console.log(sales);
//     // generateWeeklySalesCount
//     res.render('salesreport',{week:WeeklySales,Mproducts:SoldProducts,sales})
//   } catch (error) {
//     console.log(error.message);
//   }
// }

// //generate Sales Report
// const createSalesReport = async (startDate, endDate) => {
//   try {
//     // Find orders within the date range
//     const orders = await OrderDB.find({
//       orderDate: {
//         $gte: startDate,
//         $lte: endDate,
//       },
//     });

//     // Create new objects for total stock sold and product profits
//     const transformedTotalStockSold = {};
//     const transformedProductProfits = {};

//     // Helper function to fetch product details by ID
//     const getProductDetails = async (productId) => {
//       return await ProductDB.findById(productId);
//     };

//     // Iterate through each order
//     for (const order of orders) {
//       // Iterate through each product in the order
//       for (const productInfo of order.products) {
//         const productId = productInfo.productId;
//         const quantity = productInfo.quantity;

//         // Fetch product details
//         const product = await getProductDetails(productId);
//         const productName = product.product_name;
//         const image = product.images.image1;
//         const shape = product.frame_shape

//         // Update the total stock sold
//         if (!transformedTotalStockSold[productId]) {
//           transformedTotalStockSold[productId] = {
//             id: productId,
//             name: productName,
//             quantity: 0,
//             image: image,
//             shape:shape
//           };
//         }
//         transformedTotalStockSold[productId].quantity += quantity;

//         // Update the product profits
//         if (!transformedProductProfits[productId]) {
//           transformedProductProfits[productId] = {
//             id: productId,
//             name: productName,
//             profit: 0,
//             image: image,
//           };
//         }
//         const productPrice = product.price;
//         const productCost = productPrice * 0.3;
//         const productProfit = (productPrice - productCost) * quantity;
//         transformedProductProfits[productId].profit += productProfit;
//       }
//     }

//     // Convert the transformed objects to arrays
//     const totalStockSoldArray = Object.values(transformedTotalStockSold);
//     const productProfitsArray = Object.values(transformedProductProfits);

//     // Calculate the total sales
//     const totalSales = productProfitsArray.reduce(
//       (total, product) => total + product.profit,
//       0
//     );

//     // Create the final sales report object
//     const salesReport = {
//       totalSales,
//       totalStockSold: totalStockSoldArray,
//       productProfits: productProfitsArray,
//     };

//     // Print or return the sales report
//     return salesReport;
//   } catch (error) {
//     console.error("Error generating the sales report:", error.message);
//   }
// };
// // const createSalesReport = async (startDate, endDate) => {
// //   try {
// //     // Find orders within the date range
// //     const orders = await OrderDB.find({
// //       orderDate: {
// //         $gte: startDate,
// //         $lte: endDate,
// //       },
// //     });

// //     // Create a data structure to store the report
// //     const salesReport = {
// //       totalSales: 0,
// //       totalStockSold: {},
// //       productProfits: {},
// //     };

// //     // Helper function to fetch product details by ID
// //     const getProductDetails = async (productId) => {
// //       return await ProductDB.findById(productId);
// //     };

// //     // Iterate through each order
// //     for (const order of orders) {
// //       // Iterate through each product in the order
// //       for (const productInfo of order.products) {
// //         const productId = productInfo.productId;
// //         const quantity = productInfo.quantity;

// //         // Fetch product details
// //         const product = await getProductDetails(productId);
// //         const productName = product.product_name; // Get product name
// //         const image = product.images.image1

// //         // Update the total sales
// //         const productPrice = product.price;
// //         const productSales = productPrice * quantity;
// //         salesReport.totalSales += productSales;

// //         // Update the total stock sold
// //         if (!salesReport.totalStockSold[productId]) {
// //           salesReport.totalStockSold[productId] = {
// //             name: productName, // Include product name
// //             quantity: 0,
// //             image: image,
// //           };
// //         }
// //         salesReport.totalStockSold[productId].quantity += quantity;

// //         // Calculate and update the product profits
// //         const productCost = productPrice*0.3;
// //         const productProfit = (productPrice - productCost) * quantity;

// //         if (!salesReport.productProfits[productId]) {
// //           salesReport.productProfits[productId] = {
// //             name: productName, // Include product name
// //             profit: 0,
// //             image: image
// //           };
// //         }
// //         salesReport.productProfits[productId].profit += productProfit;
// //       }
// //     }

// //     // Print or return the sales report with product names
// //     // console.log("Sales Report:", salesReport);
// //     return salesReport;

// //   } catch (error) {
// //     console.error("Error generating the sales report:", error.message);
// //   }
// // };
// // Example usage




// //weekly report chart
// // -----------------------
// const generateWeeklySalesCount = async () => {
//   try {
//     // Initialize an array to store sales counts for each day
//     const weeklySalesCounts = [];

//     // Get today's date
//     const today = new Date();
//     today.setHours(today.getHours() - 5); // Adjust for UTC+5


//     // Iterate through the past 7 days
//     for (let i = 0; i < 7; i++) {
//       const startDate = new Date(today);
//       startDate.setDate(today.getDate() - i); // i days ago
//       const endDate = new Date(startDate);
//       endDate.setDate(startDate.getDate() + 1); // Next day

//       // Find orders within the date range
//       const orders = await OrderDB.find({
//         orderDate: {
//           $gte: startDate,
//           $lt: endDate,
//         },
//       });

//       // Calculate the sales count for the day
//       const salesCount = orders.length;

//       // Push the sales count to the weeklySalesCounts array
//       weeklySalesCounts.push({
//         date: startDate.toISOString().split('T')[0], // Format the date
//         sales: salesCount,
//       });
//     }

//     // Log or return the weekly sales counts
//     // console.log('Weekly Sales Counts:', weeklySalesCounts);
//     return weeklySalesCounts;

//   } catch (error) {
//     console.error('Error generating the weekly sales counts:', error.message);
//   }
// };

// // Call the function to generate the weekly sales count
// // generateWeeklySalesCount();

// //most selling products report
// // -----------------------------------

// const getMostSellingProducts = async () => {
//   try {
//     const pipeline = [
//       {
//         $unwind: '$products', // Split order into individual products
//       },
//       {
//         $group: {
//           _id: '$products.productId',
//           count: { $sum: '$products.quantity' }, // Count the sold quantity
//         },
//       },
//       {
//         $lookup: {
//           from: 'products', // Name of your Product model's collection
//           localField: '_id',
//           foreignField: '_id',
//           as: 'productData',
//         },
//       },
//       {
//         $sort: { count: -1 }, // Sort by count in descending order
//       },
//       {
//         $limit: 6, // Limit to the top 6 products
//       },
//     ];

//     const mostSellingProducts = await OrderDB.aggregate(pipeline);
//     return mostSellingProducts;
//   } catch (error) {
//     console.error('Error fetching most selling products:', error);
//     return [];
//   }
// };

// Usage
// getMostSellingProducts()
//   .then((result) => {
//     console.log('Most selling products:', result);
//   })
//   .catch((error) => {
//     console.error('Error:', error);
//   });

const errorpageHandil = async(req,res)=>{
  try {
    res.render('error')
  } catch (error) {
    console.log(error.message);
  }
}


//dashreport
// ==================

const createSalesReport = async (interval) => {
  try {
    let startDate, endDate;

    if (interval === "day") {
      const today = new Date();
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0); // Start of the day
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999); // End of the day
    } else {
      startDate = getStartDate(interval);
      endDate = getEndDate(interval);
    }

    const orders = await OrderDB.find({
      orderDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const transformedTotalStockSold = {};
    const transformedProductProfits = {};

    const getProductDetails = async (productId) => {
      return await ProductDB.findById(productId);
    };

    for (const order of orders) {
      for (const productInfo of order.products) {
        const productId = productInfo.productId;
        const quantity = productInfo.quantity;

        const product = await getProductDetails(productId);
        const productName = product.product_name;
        const image = product.images.image1;
        const shape = product.frame_shape;
        const price = product.price;

        if (!transformedTotalStockSold[productId]) {
          transformedTotalStockSold[productId] = {
            id: productId,
            name: productName,
            quantity: 0,
            image: image,
            shape: shape,
          };
        }
        transformedTotalStockSold[productId].quantity += quantity;

        if (!transformedProductProfits[productId]) {
          transformedProductProfits[productId] = {
            id: productId,
            name: productName,
            profit: 0,
            image: image,
            shape: shape,
            price: price,
          };
        }
        const productPrice = product.price;
        const productCost = productPrice * 0.3;
        const productProfit = (productPrice - productCost) * quantity;
        transformedProductProfits[productId].profit += productProfit;
      }
    }

    const totalStockSoldArray = Object.values(transformedTotalStockSold);
    const productProfitsArray = Object.values(transformedProductProfits);

    const totalSales = productProfitsArray.reduce(
      (total, product) => total + product.profit,
      0
    );

    const salesReport = {
      totalSales,
      totalStockSold: totalStockSoldArray,
      productProfits: productProfitsArray,
    };

    return salesReport;
  } catch (error) {
    console.error("Error generating the sales report:", error.message);
  }
};

const getStartDate = (interval) => {
  const start = new Date();
  if (interval === "week") {
    start.setDate(start.getDate() - start.getDay()); // Start of the week
  } else if (interval === "year") {
    start.setMonth(0, 1); // Start of the year
  }
  return start;
};

const getEndDate = (interval) => {
  const end = new Date();
  if (interval === "week") {
    end.setDate(end.getDate() - end.getDay() + 6); // End of the week
  } else if (interval === "year") {
    end.setMonth(11, 31); // End of the year
  }
  return end;
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
  adminLogOut,
  genarateSalesReports,
  errorpageHandil
  // createSalesReport,
  // salesReportPageLoad,
  // generateWeeklySalesCount,
  // getMostSellingProducts
};
