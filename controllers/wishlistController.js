const UserDB = require("../models/userModel").User;
const WishDB = require("../models/userModel").Wishlist;
const ProductDB = require("../models/productsModel").product;

// add to wishlist
// ----------------
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userWishlist = await WishDB.findOne({ user: req.session.user_id });

    if (!userWishlist) {
      const newWishlist = new WishDB({
        user: req.session.user_id,
        products: [{ product: productId }],
      });

      const result = await newWishlist.save();
      console.log(result);
      res.json({ status: 1 });
    } else {
      const alreadyWish = userWishlist.products.find(
        (item) => item.product == productId
      );
      if (alreadyWish) {
        res.json({ status: 0 });
      } else {
        userWishlist.products.push({ product: productId });
        await userWishlist.save();
        res.json({ status: 1 });
      }
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: "error" });
  }
};

///wish list page load
// ----------------------------
const wishListPageLoad = async (req, res) => {
  try {
    let wishlist = await WishDB.findOne({ user: req.session.user_id });
    // console.log(wishlist);

    if (wishlist) {
      const wishItem = [];
      for (const items of wishlist.products) {
        const productId = items.product;
        // console.log(productId);
        const productDetails = await ProductDB.findById(productId, {
          images: 1,
          product_name: 1,
          frame_shape: 1,
          price: 1,
          stock:1
        });
        const item = {
          product:productDetails
        }
        wishItem.push(item);
      }
      console.log(wishItem);
      res.render("wishlist", { user: req.session.user_id, item: wishItem });
    } else {
      res.render("wishlist", { user: req.session.user_id, item: 0 });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//remove item from wishlist
// -----------------------------
const removeItemFromWish = async(req,res)=>{
  try {
    console.log(req.body);
    const { productId } =req.body
    const wishList = await WishDB.findOne({user:req.session.user_id})
    wishList.products = wishList.products.filter(
      (wishitem)=> wishitem.product.toString()!== productId.toString())
    let remove = await wishList.save()  
    console.log(remove);
    res.json({status:"remove"})
    console.log(wishList);
  } catch (error) {
    console.log(error.message);
  }
}


// ===================
module.exports = {
  addToWishlist,
  wishListPageLoad,
  removeItemFromWish
};
