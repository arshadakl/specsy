const express = require('express')
const router = express()
const bodyParser = require("body-parser")
const multer = require('multer')
const path = require('path')
const auth = require("../middleware/user")
const fileUpload = require('../middleware/fileUpload')


router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))


router.set('view engine', 'ejs');
router.set('views','./views/user/')

const userController = require("../controllers/userController")
const productController = require('../controllers/productsController')




router.get('/',userController.homePageLoad)

router.get('/signup',auth.isLogout,userController.loadSignup)
router.post("/signup",auth.isLogout,userController.inserUser)

router.get('/login',auth.isLogout,userController.loginPageLoad)
router.post('/login',auth.isLogout,userController.doLogin)
router.get('/logout',userController.doLogout)

router.post('/changepassword',userController.changepassword)

router.get('/otp',userController.optPageLoad)
router.post('/otp',userController.otpValid)
router.get('/expire',userController.otpValid)

router.get('/reotp',userController.reVerifyUser)
router.get('/verifypage',userController.verifyPageLoad)


router.get('/profile',auth.isLogin,userController.profilePageLoad)
router.post('/updateUser',auth.isLogin,userController.updateUserData)
router.post('/updatePhoto',auth.isLogin,fileUpload.upload.single("image"),userController.updatePhoto)

router.get('/cart',auth.isLogin,userController.cartPageLoad)

router.post('/addtocart',auth.isLogin,userController.addtoCart)
router.post('/changeqty',auth.isLogin,userController.productQuantityHandlling)
router.delete('/removecartproduct',userController.removeCartItem)

// product related routers
router.get('/product',productController.singleProductLoad)



module.exports = router