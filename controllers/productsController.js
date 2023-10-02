const ProductDB = require('../models/productsModel').product
const UserDB = require('../models/userModel')
const CategoryDB = require('../models/productsModel').category



const singleProductLoad = async(req,res)=>{
    try {
        let product = await ProductDB.find({_id:req.query.id})
        // let relatedProducts = await ProductDB.find({_id:{$ne:req.query.id}})
        // console.log(product[0].frame_shape);
        let relatedProducts = await ProductDB.find({'$and':[{frame_shape:product[0].frame_shape},{_id:{"$ne":product[0]._id}}]})
        // console.log(product);
        // let user = await UserDB.findOne({_id:req.sesss})
        console.log(relatedProducts);
        res.render('product',{product:product,user:req.session.user_id,relatedProducts})
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    singleProductLoad
}