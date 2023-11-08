const UserDB = require("../models/userModel").User;
const ProductDB = require("../models/productsModel").product;
const CategoryDB = require("../models/productsModel").category;
const OrderDB = require("../models/orderModel").Order;
const BannerDB = require("../models/productsModel").banner;
const sharp = require("sharp");



const BannerPageLoader = async(req,res)=>{
    try {
        const banners =  await BannerDB.find()
        console.log(banners);
        res.render('banner',{banners})
    } catch (error) {
        console.log(error.message);
    }
}

const bannerEditPageLoad = async(req,res)=>{
    try {
        if(!req.query.banner || req.query.banner>=4 || req.query.banner<=0 || isNaN(req.query.banner)){
           return res.redirect('/admin/banner')
        }
        const banner =  await BannerDB.findOne({bannerNumber: req.query.banner})
        return res.render('banneredit',{banner})
    } catch (error) {
        console.log(error.message);
    }
}


const bannerUpdate = async(req,res)=>{
    try {
        console.log(req.body);
        const {subhead, Titile, link, bannerTarget} = req.body
        const Banner =  await BannerDB.findOne({bannerNumber: bannerTarget})
        if(!Banner){
            return res.redirect('/admin/banner')
        }
        if(req.file){
            Banner.image = req.file.filename
            await sharp("public/products/banner/temp/" + req.file.filename)
                  .resize(1552, 872)
                  .toFile("public/products/banner/" + req.file.filename);
            
            await sharp("public/products/banner/temp/" + req.file.filename)
            .resize(720, 600)
            .toFile("public/products/banner/mobile/" + req.file.filename);               
        }

        Banner.subtext = subhead
        Banner.mainHead = Titile
        Banner.link = link
        Banner.save()
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    BannerPageLoader,
    bannerUpdate,
    bannerEditPageLoad
}