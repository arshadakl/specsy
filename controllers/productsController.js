const UserDB = require("../models/userModel").User;
const AdminDB = require("../models/adminModel");
const ProductDB = require("../models/productsModel").product;
const CategoryDB = require("../models/productsModel").category;
const OrderDB = require("../models/orderModel").Order;
const sharp = require("sharp");

const singleProductLoad = async (req, res) => {
  try {
    let product = await ProductDB.find({ _id: req.query.id });
    if (!product) {
      res.status(404).send("here is nothing...");
    } else {
      let relatedProducts = await ProductDB.find({
        $and: [
          { frame_shape: product[0].frame_shape },
          { _id: { $ne: product[0]._id } },{unlist:{$eq:0}}
        ],
      });
      res.render("product", {
        product: product,
        user: req.session.user_id,
        relatedProducts,
      });
    }
    // let relatedProducts = await ProductDB.find({_id:{$ne:req.query.id}})
    // console.log(product[0].frame_shape);
    // console.log(product);
    // let user = await UserDB.findOne({_id:req.sesss})
    // console.log(relatedProducts);
  } catch (error) {
    console.log(error.message);
  }
};

// xxxxxxxxxxxxxxx

// This function used to products Searching for listing, return searched products
// ---------------------------------------
const productSearchByKey = async (key) => {
  try {
    console.log("search api called...");
    // console.log(key);
    let products = await ProductDB.find({
      $or: [
        { product_name: { $regex: key, $options: "i" } },
        { frame_shape: { $regex: key, $options: "i" } },
      ],
    });

    // console.log(products);
    return products;
  } catch (error) {
    console.log(error.message);
  }
};

// products listing page loading
// ---------------------------------------
const productPageLoad = async (req, res) => {
  try {
    let products = await ProductDB.find({});
    // console.log(products);
    res.render("products", { products: products });
  } catch (error) {
    console.log(error.message);
  }
};

// This load Product adding page
// ---------------------------------------
const addproductPageLoad = async (req, res) => {
  try {
    let categories = await CategoryDB.find({});
    res.render("addProduct", { categories: categories });
  } catch (error) {
    console.log(error.message);
  }
};

// This handilling Add products , with imagess
// ---------------------------------------
const addProduct = async (req, res) => {
  try {
    let details = req.body;
    const files = await req.files;
    console.log(files);

    console.log(
      files.image1[0].filename,
      files.image2[0].filename,
      files.image3[0].filename,
      files.image4[0].filename
    );
    const img = [
      files.image1[0].filename,
      files.image2[0].filename,
      files.image3[0].filename,
      files.image4[0].filename,
    ];

    for (let i = 0; i < img.length; i++) {
      await sharp("public/products/images/" + img[i])
        .resize(480, 480)
        .toFile("public/products/crop/" + img[i]);
    }

    let product = new ProductDB({
      product_name: details.product_name,
      price: details.price,
      frame_shape: details.frame_shape,
      gender: details.gender,
      description: details.description,
      stock: details.stock,
      "images.image1": files.image1[0].filename,
      "images.image2": files.image2[0].filename,
      "images.image3": files.image3[0].filename,
      "images.image4": files.image4[0].filename,
    });

    let result = await product.save();
    console.log(result);
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

// Product edit page Load..
// ---------------------------------------
const productEditPageLoad = async (req, res) => {
  try {
    let product = await getProductDetails(req.query.id);
    let categories = await CategoryDB.find({});
    res.render("editProduct", { product: product, categories: categories });
  } catch (error) {
    console.log(error.message);
  }
};

// This Handdil to Search Product
// ---------------------------------------
const searchproduct = async (req, res) => {
  try {
    // console.log(req.query.key);
    let products = await productSearchByKey(req.query.key);
    // console.log(products);
    res.render("products", { products: products });
  } catch (error) {
    console.log(error.message);
  }
};

// This Function used to Update Product , includuing Image Managment..
// ---------------------------------------
const updateProduct = async (req, res) => {
  try {
    let details = req.body;
    let imagesFiles = req.files;
    let currentData = await getProductDetails(req.query.id);

    const img = [
      imagesFiles.image1
        ? imagesFiles.image1[0].filename
        : currentData.images.image1,
      imagesFiles.image2
        ? imagesFiles.image2[0].filename
        : currentData.images.image2,
      imagesFiles.image3
        ? imagesFiles.image3[0].filename
        : currentData.images.image3,
      imagesFiles.image4
        ? imagesFiles.image4[0].filename
        : currentData.images.image4,
    ];

    for (let i = 0; i < img.length; i++) {
      await sharp("public/products/images/" + img[i])
        .resize(480, 480)
        .toFile("public/products/crop/" + img[i]);
    }

    let img1, img2, img3, img4;

    img1 = imagesFiles.image1
      ? imagesFiles.image1[0].filename
      : currentData.images.image1;
    img2 = imagesFiles.image2
      ? imagesFiles.image2[0].filename
      : currentData.images.image2;
    img3 = imagesFiles.image3
      ? imagesFiles.image3[0].filename
      : currentData.images.image3;
    img4 = imagesFiles.image4
      ? imagesFiles.image4[0].filename
      : currentData.images.image4;

    let update = await ProductDB.updateOne(
      { _id: req.query.id },
      {
        $set: {
          product_name: details.product_name,
          price: details.price,
          frame_shape: details.frame_shape,
          gender: details.gender,
          description: details.description,
          stock: details.stock,
          "images.image1": img1,
          "images.image2": img2,
          "images.image3": img3,
          "images.image4": img4,
        },
      }
    );

    console.log(update);

    res.redirect("/admin/products");
  } catch (error) {
    if (req.fileFilterError && req.fileFilterError.redirectTo) {
      return res.redirect(req.fileFilterError.redirectTo);
    }
  }
};

//   This used to Delete Product
// ---------------------------------------
const deleteproduct = async (req, res) => {
  try {
    console.log(req.query.id);
    let removeProduct = await ProductDB.deleteOne({ _id: req.query.id });
    console.log(removeProduct);
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
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

// shop page loading with pagenation
// ----------------------------------------------------------------
const shopPageLoad = async (req, res) => {
  try {
    const categories = await CategoryDB.find()
    let page = req.query.page || 1;
    let pageDB = Number(page) - 1;
    let productPerPage = 9;
    let totalProduct = await ProductDB.countDocuments();
    let totalPage = Math.ceil(totalProduct / productPerPage);
    let products = await ProductDB.find({unlist:{$eq:0}})
      .skip(pageDB * productPerPage)
      .limit(productPerPage);

    res.render("shop", {
      products: products,
      user: req.session.user_id,
      totalPage,
      curentPage: Number(page),
      categories
    });
    // res.status(200).json(products)
  } catch (error) {
    console.log(error.message);
  }
};

const shopPageSearch = async (req, res) => {
  try {
    const categories = await CategoryDB.find()
    let page = req.query.page || 1;
    let pageDB = Number(page) - 1;
    let productPerPage = 9;
    let key = req.query.key;
    
    // Calculate the total number of products that match the search criteria
    let totalProduct = await ProductDB.countDocuments({
      $or: [
        { product_name: { $regex: key, $options: "i" } },
        { frame_shape: { $regex: key, $options: "i" } },
      ],
    });
    
    let totalPage = Math.ceil(totalProduct / productPerPage);
    
    // Query products based on the search criteria and pagination
    let products = await ProductDB.find({
      $or: [
        { product_name: { $regex: key, $options: "i" } },
        { frame_shape: { $regex: key, $options: "i" } },
      ],
    })
      .skip(pageDB * productPerPage)
      .limit(productPerPage);
    
    res.render("shop", {
      products: products,
      user: req.session.user_id,
      totalPage,
      curentPage: Number(page),
      categories
    });
  } catch (error) {
    // Handle errors appropriately
  }
};

// This used to list and unlist user , this function working with Ajax
// ---------------------------------------

const prducutListUnlist = async (req, res) => {
  try {
    let listStatus = await ProductDB.findOne({ _id: req.body.id });
    
    console.log(listStatus.unlist);
    if (listStatus.unlist === 0) {
      await ProductDB.updateOne(
        { _id: req.body.id },
        { $set: { unlist: 1 } }
      );
    } else {
      await ProductDB.updateOne(
        { _id: req.body.id },
        { $set: { unlist: 0 } }
      );
    }

    let product = await ProductDB.findOne({_id: req.body.id});
    // console.log(product);
    res.json({ product: product });
  } catch (error) {
    console.log(error.message);
  }
};






// const queryTester = async (req, res) => {
//   try {
//     let page = req.query.page || 1;
//     let pageDB = Number(page) - 1;
//     let productPerPage = 9;
//     let key = req.query.key || "";
//     let frameShape = req.query.frame_shape || "";
//     let gender = req.query.gender || "";
//     let minPrice = req.query.min_price || "";
//     let maxPrice = req.query.max_price || "";

//     // Get the categories query parameter as a comma-separated string
//     const categoriesQueryParam = req.query.categories;

//     // Parse the categories into an array by splitting on the comma delimiter
//     const categories = categoriesQueryParam ? categoriesQueryParam.split(',') : [];

//     // Construct a regex pattern for each category
//     const categoryRegexPatterns = categories.map(category => new RegExp(`^${category}$`, 'i'));

//     // Construct the $or array based on the provided search parameters
//     const orConditions = [
//       key ? { product_name: { $regex: key, $options: "i" } } : {},
//       frameShape ? { frame_shape: { $regex: frameShape, $options: "i" } } : {},
//       gender ? { gender: { $regex: gender, $options: "i" } } : {},
//       (minPrice !== "" && maxPrice !== "") ? { price: { $gte: minPrice, $lte: maxPrice } } : {},
//       categories.length ? { category: { $in: categoryRegexPatterns } } : {},
//     ];

//     // Build the aggregation pipeline
//     const pipeline = [
//       {
//         $match: {
//           $or: orConditions
//         }
//       },
//       {
//         $skip: pageDB * productPerPage
//       },
//       {
//         $limit: productPerPage
//       }
//     ];

//     // Perform aggregation
//     const aggregationResult = await ProductDB.aggregate(pipeline);

//     // Calculate the total number of products that match the search criteria
//     const totalProduct = await ProductDB.aggregate([
//       { $match: { $or: orConditions } },
//       { $count: "total" }
//     ]);

//     let totalPage = Math.ceil(totalProduct.length > 0 ? totalProduct[0].total / productPerPage : 0);
//     console.log(aggregationResult);
//     res.render("shop", {
//       products: aggregationResult,
//       totalPage,
//       curentPage: Number(page),
//       user: req.session.user_id,
//       totalPage,
// });
//   } catch (error) {
//     console.log(error.message);
//   }
// };
// queryTester
// const categories = await CategoryDB.find()


// const queryTester = async (req, res) => {
//   try {
//     const categories = await CategoryDB.find();

//     let page = req.query.page || 1;
//     let pageDB = Number(page) - 1;
//     let productPerPage = 9;
//     let key = req.query.key;

//     // Define the base search criteria
//     const searchCriteria = {};

//     if (key) {
//       searchCriteria.$or = [
//         { product_name: { $regex: key, $options: "i" } },
//         { frame_shape: { $regex: key, $options: "i" } },
//         { gender: { $regex: key, $options: "i" } },
//       ];
//     }

//     if (Array.isArray(req.query.frame_shape)) {
//       // Handle multiple frame_shape values as an array
//       searchCriteria.frame_shape = {
//         $in: req.query.frame_shape.map((shape) => ({
//           $regex: shape,
//           $options: "i",
//         })),
//       };
//     } else if (req.query.frame_shape) {
//       // Handle a single frame_shape value
//       searchCriteria.frame_shape = {
//         $regex: req.query.frame_shape,
//         $options: "i",
//       };
//     }

//     if (req.query.gender) {
//       searchCriteria.gender = { $regex: req.query.gender, $options: "i" };
//     }

//     if (req.query.min_price && req.query.max_price) {
//       searchCriteria.price = {
//         $gte: req.query.min_price,
//         $lte: req.query.max_price,
//       };
//     } else if (req.query.min_price) {
//       searchCriteria.price = { $gte: req.query.min_price };
//     } else if (req.query.max_price) {
//       searchCriteria.price = { $lte: req.query.max_price };
//     }

//     // Calculate the total number of products that match the search criteria
//     let totalProduct = await ProductDB.countDocuments(searchCriteria);

//     let totalPage = Math.ceil(totalProduct / productPerPage);

//     // Query products based on the search criteria and pagination
//     let products = await ProductDB.find(searchCriteria)
//       .skip(pageDB * productPerPage)
//       .limit(productPerPage);

//     res.render("shop", {
//       products: products,
//       user: req.session.user_id,
//       totalPage,
//       curentPage: Number(page),
//       categories,
//     });
//   } catch (error) {
//     // Handle errors appropriately
//   }
// };


// const queryTester = async (req, res) => {
//   try {
//     const categories = await CategoryDB.find();

//     let page = req.query.page || 1;
//     let pageDB = Number(page) - 1;
//     let productPerPage = 9;
//     let key = req.query.key;

//     // Define the base search criteria
//     const searchCriteria = {};

//     if (key) {
//       searchCriteria.$or = [
//         { product_name: { $regex: key, $options: "i" } },
//         { frame_shape: { $regex: key, $options: "i" } },
//         { gender: { $regex: key, $options: "i" } },
//       ];
//     }

//     if (req.query.frame_shape) {
//       // Split the comma-separated values and handle them as an array
//       const frameShapes = req.query.frame_shape.split(',');

//       // Check if frameShapes is an array and not empty
//       if (Array.isArray(frameShapes) && frameShapes.length > 0) {
//         // Handle multiple frame_shape values as an array
//         searchCriteria.frame_shape = { $in: frameShapes };
//       }
//     }

//     if (req.query.gender) {
//       searchCriteria.gender = { $regex: req.query.gender, $options: "i" };
//     }

//     // ... (rest of the code remains the same)
//   } catch (error) {
//     // Handle errors appropriately
//   }
// };

const queryTester = async (req, res) => {
  try {
    const categories = await CategoryDB.find();
    const page = req.query.page || 1;
    const pageDB = Number(page) - 1;
    const productPerPage = 9;
    const key = req.query.key || "";
    let query = {};

    // Calculate the total number of products that match the search criteria
    let totalProduct;

    if (key !== "") {
      totalProduct = await ProductDB.countDocuments({
        $or: [
          { product_name: { $regex: key, $options: "i" } },
          { frame_shape: { $regex: key, $options: "i" } },
        ],
      });
    } else {
      // Check and accumulate filter conditions based on query parameters
      if (req.query.frame_shape) {
        const frameShapes = req.query.frame_shape.split("%2C").map(shape => shape.charAt(0).toUpperCase() + shape.slice(1));
        query.frame_shape = { $in: frameShapes };
      }

      if (req.query.gender) {
        const capitalizedGender = req.query.gender.split(",").map(shape => shape.charAt(0).toUpperCase() + shape.slice(1));
        query.gender = capitalizedGender;
      }

      if (req.query.minPrice && req.query.maxPrice) {
        const minPrice = parseFloat(req.query.minPrice);
        const maxPrice = parseFloat(req.query.maxPrice);
        query.price = { $gte: minPrice, $lte: maxPrice };
      }

      // Continue to add more filter conditions as needed

      // Calculate the total number of products that match the filter conditions
      totalProduct = await ProductDB.countDocuments(query);
    }

    const totalPage = Math.ceil(totalProduct / productPerPage);

    console.log(query);
    // Query products based on the search or filter criteria and pagination
    const products = key !== ""
      ? await ProductDB.find({
          $or: [
            { product_name: { $regex: key, $options: "i" } },
            { frame_shape: { $regex: key, $options: "i" } },
          ],
        })
        .skip(pageDB * productPerPage)
        .limit(productPerPage)
      : await ProductDB.find(query)
        .skip(pageDB * productPerPage)
        .limit(productPerPage);
// console.log(products);
    res.render("shop", {
      products,
      user: req.session.user_id,
      totalPage,
      curentPage: Number(page),
      categories,
    });
  } catch (error) {
    console.log(error.message);
    // Handle the error
    res.status(500).send("An error occurred");
  }
};




// res.json({
//   products: aggregationResult,
//   totalPage,
//   curentPage: Number(page),
// });
// res.render("shop", {
//   products: products,
//   user: req.session.user_id,
//   totalPage,
//   curentPage: Number(page),
// });
// http://example.com/products?&key=glasses&price_min=20&price_max=50&categories=eyewear,accessories&gender=unisex&frame_shape=rectangle

module.exports = {
  singleProductLoad,
  productPageLoad,
  addproductPageLoad,
  addProduct,
  productEditPageLoad,
  searchproduct,
  updateProduct,
  deleteproduct,
  shopPageLoad,
  shopPageSearch,
  prducutListUnlist,
  queryTester
};
