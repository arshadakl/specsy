const UserDB = require("../models/userModel").User;
const AdminDB = require("../models/adminModel");
const ProductDB = require("../models/productsModel").product;
const CategoryDB = require("../models/productsModel").category;
const OrderDB = require("../models/orderModel").Order;
const PaymentDB = require("../models/paymentModel").TransactionHistory;
const AnalyticsDB = require("../models/analyticModel");
const XLSX = require("xlsx");
const ExcelJS = require("exceljs");
const pdfMake = require('pdfmake');
const puppeteer = require('puppeteer');



//sales report page load
// -------------------------------
const salesReportPageLoad = async(req,res)=>{
    try {
      const sales = await createSalesReport("2023-10-01", "2023-10-31");
      const WeeklySales = await generateWeeklySalesCount()
      const SoldProducts = await getMostSellingProducts()
      // console.log(sales);
      // generateWeeklySalesCount
      res.render('salesreport',{week:WeeklySales,Mproducts:SoldProducts,sales})
    } catch (error) {
      console.log(error.message);
    }
  }
  
  //generate Sales Report
  const createSalesReport = async (startDate, endDate) => {
    try {
      // Find orders within the date range
      const orders = await OrderDB.find({
        orderDate: {
          $gte: startDate,
          $lte: endDate,
        },
      });
  
      // Create new objects for total stock sold and product profits
      const transformedTotalStockSold = {};
      const transformedProductProfits = {};
  
      // Helper function to fetch product details by ID
      const getProductDetails = async (productId) => {
        return await ProductDB.findById(productId);
      };
  
      // Iterate through each order
      for (const order of orders) {
        // Iterate through each product in the order
        for (const productInfo of order.products) {
          const productId = productInfo.productId;
          const quantity = productInfo.quantity;
  
          // Fetch product details
          const product = await getProductDetails(productId);
          const productName = product.product_name;
          const image = product.images.image1;
          const shape = product.frame_shape
          const price = product.price;
  
          // Update the total stock sold
          if (!transformedTotalStockSold[productId]) {
            transformedTotalStockSold[productId] = {
              id: productId,
              name: productName,
              quantity: 0,
              image: image,
              shape:shape
            };
          }
          transformedTotalStockSold[productId].quantity += quantity;
  
          // Update the product profits
          if (!transformedProductProfits[productId]) {
            transformedProductProfits[productId] = {
              id: productId,
              name: productName,
              profit: 0,
              image: image,
              shape:shape,
              price:price
            };
          }
          const productPrice = product.price;
          const productCost = productPrice * 0.3;
          const productProfit = (productPrice - productCost) * quantity;
          transformedProductProfits[productId].profit += productProfit;
        }
      }
  
      // Convert the transformed objects to arrays
      const totalStockSoldArray = Object.values(transformedTotalStockSold);
      const productProfitsArray = Object.values(transformedProductProfits);
  
      // Calculate the total sales
      const totalSales = productProfitsArray.reduce(
        (total, product) => total + product.profit,
        0
      );
  
      // Create the final sales report object
      const salesReport = {
        totalSales,
        totalStockSold: totalStockSoldArray,
        productProfits: productProfitsArray,
      };
  
      // Print or return the sales report
      return salesReport;
    } catch (error) {
      console.error("Error generating the sales report:", error.message);
    }
  };
  
  
  
  //weekly report chart
  // -----------------------
  const generateWeeklySalesCount = async () => {
    try {
      // Initialize an array to store sales counts for each day
      const weeklySalesCounts = [];
  
      // Get today's date
      const today = new Date();
      today.setHours(today.getHours() - 5); // Adjust for UTC+5
  
  
      // Iterate through the past 7 days
      for (let i = 0; i < 7; i++) {
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - i); // i days ago
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1); // Next day
  
        // Find orders within the date range
        const orders = await OrderDB.find({
          orderDate: {
            $gte: startDate,
            $lt: endDate,
          },
        });
  
        // Calculate the sales count for the day
        const salesCount = orders.length;
  
        // Push the sales count to the weeklySalesCounts array
        weeklySalesCounts.push({
          date: startDate.toISOString().split('T')[0], // Format the date
          sales: salesCount,
        });
      }
  
      // Log or return the weekly sales counts
      // console.log('Weekly Sales Counts:', weeklySalesCounts);
      return weeklySalesCounts;
  
    } catch (error) {
      console.error('Error generating the weekly sales counts:', error.message);
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
          $unwind: '$products', // Split order into individual products
        },
        {
          $group: {
            _id: '$products.productId',
            count: { $sum: '$products.quantity' }, // Count the sold quantity
          },
        },
        {
          $lookup: {
            from: 'products', // Name of your Product model's collection
            localField: '_id',
            foreignField: '_id',
            as: 'productData',
          },
        },
        {
          $sort: { count: -1 }, // Sort by count in descending order
        },
        {
          $limit: 6, // Limit to the top 6 products
        },
      ];
  
      const mostSellingProducts = await OrderDB.aggregate(pipeline);
      return mostSellingProducts;
    } catch (error) {
      console.error('Error fetching most selling products:', error);
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
    const worksheet = workbook.addWorksheet('Sales Report');

    // Define the columns for the worksheet
    worksheet.columns = [
      { header: 'Product Name', key: 'productName',width:25 },
      { header: 'Frame Shape', key: 'shape',width:25  },
      { header: 'Price', key: 'price',width:15  },
      { header: 'Profit', key: 'profit',width:15  },
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
      productName: 'Total Sales:',
      shape: '',
      price: '',
      profit: sales.totalSales, // Add the totalSales value here
    });

    // Stream the Excel file to the client as a response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

    workbook.xlsx.write(res)
      .then(() => {
        res.end();
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error generating the Excel report');
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
    console.log(sales);
    // Call the generatePDFReport function to generate the PDF
    await generatePDFReport(sales);

    // Send the generated PDF as a response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
    
    // Send the PDF file
    res.sendFile('sales_report.pdf', { root: './' }); // Adjust the root directory as needed
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error generating the PDF report');
  }
};



// _+++++++++++++++++++++++++++++

const generatePDFReport = async (sales) => {
  try {
    // Create a new browser instance
    const browser = await puppeteer.launch();

    // Create a new page
    const page = await browser.newPage();

    // Generate a dynamic HTML content with sales data
    const salesRows = sales.productProfits.map((product) => `
      <tr>
        <td>${product.name}</td>
        <td>Frame Shape</td>
        <td>${product.price}</td>
        <td>${product.profit}</td>
      </tr>`).join('');

    const totalSalesRow = `
      <tr>
        <td>Total Sales:</td>
        <td></td>
        <td></td>
        <td>${sales.totalSales}</td>
      </tr>`;

    const htmlContent = `
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

    // Set the content of the PDF with the dynamic HTML content
    await page.setContent(htmlContent);

    // Generate the PDF file
    await page.pdf({ path: 'sales_report.pdf', format: 'A4' });

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

// Usage example
const salesData = {
  // Replace this with the actual sales data
  totalSales: 5000,
  productProfits: [
    { name: 'Product A', price: 100, profit: 50 },
    { name: 'Product B', price: 200, profit: 100 },
    // Add more product data as needed
  ],
};


  // exportingss
//   ------------------
module.exports ={
    salesReportPageLoad,
    generateExcelReports,
    generatePDFReports
}