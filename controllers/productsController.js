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
          { _id: { $ne: product[0]._id } },
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
    let page = req.query.page || 1;
    let pageDB = Number(page) - 1;
    let productPerPage = 9;
    let totalProduct = await ProductDB.countDocuments();
    let totalPage = Math.ceil(totalProduct / productPerPage);
    let products = await ProductDB.find()
      .skip(pageDB * productPerPage)
      .limit(productPerPage);
    // let products = await ProductDB.find()
    // console.log(totalPage);
    // console.log(products);

    res.render("shop", {
      products: products,
      user: req.session.user_id,
      totalPage,
      curentPage: Number(page),
    });
    // res.status(200).json(products)
  } catch (error) {
    console.log(error.message);
  }
};

const shopPageSearch = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let pageDB = Number(page) - 1;
    let productPerPage = 9;
    let key = req.query.key;
    let totalProduct = await ProductDB.countDocuments();
    let totalPage = Math.ceil(totalProduct / productPerPage);
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
    });
  } catch (error) {}
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
  prducutListUnlist
};
