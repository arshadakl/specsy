const UserDB = require("../models/userModel").User;
const ProductDB = require("../models/productsModel").product;
const CategoryDB = require("../models/productsModel").category;
const OrderDB = require("../models/orderModel").Order;


//   Category Page load...
// ---------------------------------------
const categoryPageLoad = async (req, res) => {
    try {
      let categories = await CategoryDB.find({});
      // console.log(categories);
      res.render("category", { categories: categories });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  // This used to Add New category
  // ---------------------------------------
  const addCategory = async (req, res) => {
    try {
      console.log(req.body);
      let currentDate = new Date();
      let img = await req.file.filename;
      console.log(img);
      let category = new CategoryDB({
        category_name: req.body.category_name,
        icon: img,
        createdAt: currentDate.toLocaleString(),
        block: 0,
      });
  
      let result = await category.save();
      console.log(result);
      res.redirect("/admin/category");
    } catch (error) {
      console.log(error.message);
    }
  };
  
  
  
  
  
  // Function Used to Delete Category
  // ---------------------------------------
  const deleteCategory = async (req, res) => {
    try {
      let deleteItem = await CategoryDB.deleteOne({ _id: req.query.id });
      console.log(deleteItem);
      res.redirect("/admin/category");
    } catch (error) {
      console.log(error.message);
    }
  };
  
  // This working For Search Categorys
  // ---------------------------------------
  const searchCategory = async (req, res) => {
    try {
      let categories = await CategoryDB.find({
        category_name: { $regex: req.query.key, $options: "i" },
      });
      console.log(categories);
      res.render("category", { categories: categories });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  // This Working For Block Category items,
  // this working with Ajax
  // ---------------------------------------
  const categoryBlock = async (req, res) => {
    try {
      // console.log("back end called........");
      let blockStatus = await CategoryDB.findOne({ _id: req.body.id });
      console.log(blockStatus.block);
  
      if (blockStatus.block == 0) {
        let block = await CategoryDB.updateOne(
          { _id: req.body.id },
          { $set: { block: 1 } }
        );
      } else {
        let block = await CategoryDB.updateOne(
          { _id: req.body.id },
          { $set: { block: 0 } }
        );
      }
  
      let categories = await CategoryDB.find({});
      res.json({ categories: categories });
    } catch (error) {
      console.log(error.message);
    }
  };

module.exports={
    categoryPageLoad,
    addCategory,
    deleteCategory,
    searchCategory,
    categoryBlock,
}