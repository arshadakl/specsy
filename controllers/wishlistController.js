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
        res.json({ status: 1});
      } else {
        const alreadyWish = userWishlist.products.find((item) => item.product == productId);
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
  

module.exports = {
  addToWishlist,
};
