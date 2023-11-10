const UserDB = require("../models/userModel").User;
const AdminDB = require("../models/adminModel");
const ProductDB = require("../models/productsModel").product;
const CategoryDB = require("../models/productsModel").category;
const OrderDB = require("../models/orderModel").Order;
const PaymentDB = require("../models/paymentModel").TransactionHistory;
const AnalyticsDB = require("../models/analyticModel");
// const XLSX = require("xlsx");
const ExcelJS = require("exceljs");
// const pdfMake = require("pdfmake");
const puppeteer = require("puppeteer");

const salesReportPageLoad = async (req, res) => {
  try {
    let start, end;

    if (req.query.start && req.query.end) {
      start = req.query.start;
      end = new Date(req.query.end); // Convert to Date
      end.setDate(end.getDate() + 1); // Add one day to the end date
      console.log(end);
    } else {
      today = new Date();
      start = new Date(today);
      start.setDate(today.getDate() - 30);
      end = new Date(today); // Set end to one day after today
      end.setDate(today.getDate() + 1); // Add one day
      end = end.toISOString().split("T")[0];
    }

    const [sales, SoldProducts] = await Promise.all([
      createSalesReport(start, end),
      getMostSellingProducts(),
    ]);
    console.log("Debugger ====:"+sales,SoldProducts);
    if(sales === 0 ||SoldProducts==0 ){
      res.render("salesreport", {
        // week: WeeklySales,
        Mproducts: 0,
        sales:0,
      });
    }
    console.log(SoldProducts);
    res.render("salesreport", {
      // week: WeeklySales,
      Mproducts: SoldProducts,
      sales,
    });
  } catch (error) {
    console.error(error.message);
  }
};

// const salesReportSearchPageLoad = async (req, res) => {
//   try {
//     const { start, end } = req.query;
//     const sales = await createSalesReport(start, end);
//     const WeeklySales = await generateWeeklySalesCount();
//     const SoldProducts = await getMostSellingProducts();
//     // console.log(sales);
//     // generateWeeklySalesCount
//     res.render("salesreport", {
//       week: WeeklySales,
//       Mproducts: SoldProducts,
//       sales,
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

//generate Sales Report
const createSalesReport = async (startDate, endDate) => {
  try {
    const orders = await OrderDB.find({
      orderDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    if(!orders){
      return 0
    }

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

//weekly report chart
// -----------------------
const generateWeeklySalesCount = async () => {
  try {
    const weeklySalesCounts = [];

    const today = new Date();
    today.setHours(today.getHours() - 5);

    for (let i = 0; i < 7; i++) {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - i);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);

      const orders = await OrderDB.find({
        orderDate: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      const salesCount = orders.length;

      weeklySalesCounts.push({
        date: startDate.toISOString().split("T")[0], // Format the date
        sales: salesCount,
      });
    }

    return weeklySalesCounts;
  } catch (error) {
    console.error("Error generating the weekly sales counts:", error.message);
  }
};

// Call the function to generate the weekly sales count
// generateWeeklySalesCount();

//most selling products report
// -----------------------------------

const getMostSellingProducts = async () => {
  try {
    const pipeline = [
      {
        $unwind: "$products", 
      },
      {
        $group: {
          _id: "$products.productId",
          count: { $sum: "$products.quantity" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 6, // Limit to the top 6 products
      },
    ];

    const mostSellingProducts = await OrderDB.aggregate(pipeline);
    if(!mostSellingProducts){
      return 0
    }
    console.log(mostSellingProducts[0].productData);
    return mostSellingProducts;
  } catch (error) {
    console.error("Error fetching most selling products:", error);
    return [];
  }
};

// Usage
// getMostSellingProducts()
//   .then((result) => {
//     console.log('Most selling products:', result);
//   })
//   .catch((error) => {
//     console.error('Error:', error);
//   });

//genarate Excel Reports
// =======================

const generateExcelReports = async (req, res) => {
  try {
    const { end, start } = req.query;

    // Create a sales report or fetch it from your data source
    const sales = await createSalesReport(start, end);

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    // Define the columns for the worksheet
    worksheet.columns = [
      { header: "Product Name", key: "productName", width: 25 },
      { header: "Frame Shape", key: "shape", width: 25 },
      { header: "Price", key: "price", width: 15 },
      { header: "Profit", key: "profit", width: 15 },
    ];

    // Add data to the worksheet
    sales.productProfits.forEach((product) => {
      worksheet.addRow({
        productName: product.name,
        shape: product.shape, // You should replace this with the actual shape data
        price: product.price,
        profit: product.profit,
      });
    });

    // Add the 'Total Sales' value in the footer
    worksheet.addRow({
      productName: "Total Sales:",
      shape: "",
      price: "",
      profit: sales.totalSales, // Add the totalSales value here
    });

    // Stream the Excel file to the client as a response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.xlsx"
    );

    workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error generating the Excel report");
  }
};
// const genarateExcelReports = async(req,res)=>{
//   try {
//     const {end, start} = req.query
//     console.log(end, start);
//     const sales = await createSalesReport(start, end)
//     console.log(sales);

//     let workbook = new ExcelJS.Workbook()
//     const sheet = workbook.addWorksheet("book")
//     sheet.columns = [
//       { header: 'Product Name', key: 'productName' },
//       { header: 'Frame Shape', key: 'shape' },
//       { header: 'price', key: 'price' },
//       { header: 'profit', key: 'profit' },
//     ];

//     sheet.addRow({
//       productName: 'test Product',
//       shape: 'Frame Shape',
//       price: '1200',
//       profit: '5000'
//     })
//     res.setHeader('Content-Type',
//      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader(
//       "Content-Disposition",
//       "attachment;fileName=" +".xlsx"
//     )
//   } catch (error) {
//     console.log(error.message);
//   }
// }
const generatePDFReports = async (req, res) => {
  try {
    const { start, end } = req.query;
    console.log(start, end);
    const sales = await createSalesReport(start, end);
    // console.log(sales);
    // Call the generatePDFReport function to generate the PDF
    await generatePDFReport(sales);

    // Send the generated PDF as a response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.pdf"
    );

    // Send the PDF file
    res.sendFile("sales_report.pdf", { root: "./" }); // Adjust the root directory as needed
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error generating the PDF report");
  }
};

// pdf creating
// _+++++++++++++++++++++++++++++

const generatePDFReport = async (sales) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const salesRows = sales.productProfits
      .map(
        (product) => `
      <tr>
        <td>${product.name}</td>
        <td>Frame Shape</td>
        <td>${product.price}</td>
        <td>${product.profit}</td>
      </tr>`
      )
      .join("");

    const totalSalesRow = `
      <tr>
        <td>Total Sales:</td>
        <td></td>
        <td></td>
        <td>${sales.totalSales}</td>
      </tr>`;

    const htmlContent = `
      <style>
        h1 {
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
      </style>
      <h1>Sales Report</h1>
      <table>
        <tr>
          <th>Product Name</th>
          <th>Frame Shape</th>
          <th>Price</th>
          <th>Profit</th>
        </tr>
        ${salesRows}
        ${totalSalesRow}
      </table>
    `;

    await page.setContent(htmlContent);
    await page.pdf({
      path: "sales_report.pdf",
      format: "A4",
      printBackground: true,
    });

    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};
// const generatePDFReport = async (sales) => {
//   try {
//     // Create a new browser instance
//     const browser = await puppeteer.launch();

//     // Create a new page
//     const page = await browser.newPage();

//     // Generate a dynamic HTML content with sales data
//     const salesRows = sales.productProfits
//       .map(
//         (product) => `
//       <tr>
//         <td>${product.name}</td>
//         <td>Frame Shape</td>
//         <td>${product.price}</td>
//         <td>${product.profit}</td>
//       </tr>`
//       )
//       .join("");

//     const totalSalesRow = `
//       <tr>
//         <td>Total Sales:</td>
//         <td></td>
//         <td></td>
//         <td>${sales.totalSales}</td>
//       </tr>`;

//     const htmlContent = `
//       <h1>Sales Report</h1>
//       <table>
//         <tr>
//           <th>Product Name</th>
//           <th>Frame Shape</th>
//           <th>Price</th>
//           <th>Profit</th>
//         </tr>
//         ${salesRows}
//         ${totalSalesRow}
//       </table>
//     `;

//     // Set the content of the PDF with the dynamic HTML content
//     await page.setContent(htmlContent);

//     // Generate the PDF file
//     await page.pdf({ path: "sales_report.pdf", format: "A4" });

//     // Close the browser
//     await browser.close();
//   } catch (error) {
//     console.error(error.message);
//   }
// };

// Usage example
const salesData = {
  // Replace this with the actual sales data
  totalSales: 5000,
  productProfits: [
    { name: "Product A", price: 100, profit: 50 },
    { name: "Product B", price: 200, profit: 100 },
    // Add more product data as needed
  ],
};

//portfolio chart data filltering
// --------------------------------
const portfolioFiltering = async (req, res) => {
  try {
    let datePriad = req.body.date;
    console.log(datePriad);

    if (datePriad == "week") {
      let data = await generateWeeklySalesCount();
      console.log(data);
      res.json({ data });
    } else if (datePriad == "month") {
      let data = await generateMonthlySalesCount();
      data = data.reverse();
      console.log(data);

      res.json({ data });
    } else if (datePriad == "year") {
      let data = await generateYearlySalesCount();
      console.log(data);
      res.json({ data });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const generateMonthlySalesCount = async () => {
  try {
    const monthlySalesCounts = [];

    const today = new Date();
    today.setHours(today.getHours() - 5);

    // Calculate the earliest and latest months
    const latestMonth = new Date(today);
    const earliestMonth = new Date(today);
    earliestMonth.setMonth(earliestMonth.getMonth() - 7); // 7 months ago

    // Create a map to store sales data for each month
    const salesData = new Map();

    // Iterate through the complete date range
    while (earliestMonth <= latestMonth) {
      const monthString = earliestMonth.toLocaleString("default", {
        month: "long",
      });
      salesData.set(monthString, 0);
      earliestMonth.setMonth(earliestMonth.getMonth() + 1);
    }

    // Populate sales data for existing months
    for (let i = 0; i < 7; i++) {
      const startDate = new Date(today);
      startDate.setMonth(today.getMonth() - i);
      startDate.setDate(1);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);

      const orders = await OrderDB.find({
        orderDate: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      const salesCount = orders.length;
      const monthString = startDate.toLocaleString("default", {
        month: "long",
      });

      salesData.set(monthString, salesCount);
    }

    // Convert the map to an array for the final result
    for (const [date, sales] of salesData) {
      monthlySalesCounts.push({ date, sales });
    }

    return monthlySalesCounts;
  } catch (error) {
    console.error("Error generating the monthly sales counts:", error.message);
  }
};

const generateYearlySalesCount = async () => {
  try {
    const yearlySalesCounts = [];

    const today = new Date();
    today.setHours(today.getHours() - 5);

    for (let i = 0; i < 7; i++) {
      const startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - i);
      startDate.setMonth(0); // Set the start month to January
      startDate.setDate(1); // Set the start day to the first day of the year
      const endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + 1);

      const orders = await OrderDB.find({
        orderDate: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      const salesCount = orders.length;

      yearlySalesCounts.push({
        date: startDate.getFullYear(),
        sales: salesCount,
      });
    }

    return yearlySalesCounts;
  } catch (error) {
    console.error("Error generating the yearly sales counts:", error.message);
  }
};

// exportingss
//   ------------------
module.exports = {
  salesReportPageLoad,
  generateExcelReports,
  generatePDFReports,
  portfolioFiltering,
};
