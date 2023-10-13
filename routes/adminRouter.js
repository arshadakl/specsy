const express = require('express')
const router = express()
const bodyParser = require("body-parser")
const multer = require('multer')
const path = require('path')

const adminController = require('../controllers/adminController')

//auth checking middleware
const auth = require('../middleware/admin')

// image uploading middleware
const fileUpload = require('../middleware/fileUpload')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))


router.set('view engine', 'ejs');
router.set('views','./views/admin')

// routers 

router.get('/',auth.isLogin,adminController.adminPageLoad)

// user managment related routers
router.post('/blockuser',auth.isLogin,adminController.userBlock)
router.get('/edituser',auth.isLogin,adminController.editUserPageLoad)
router.post('/edituser',auth.isLogin,adminController.updateUserData)
router.get('/searchUsers',auth.isLogin,adminController.searchUsers)

// admin ath related routers
router.get('/login',auth.isLogout,adminController.loginPageLoad)
router.post('/login',auth.isLogout,adminController.doLogin)
router.get('/logout',auth.isLogin,adminController.adminLogOut)

//product management routers
router.get('/products',auth.isLogin,adminController.productPageLoad)
router.get('/products/searchproduct',auth.isLogin,adminController.searchproduct)
router.get('/products/addproduct',auth.isLogin,adminController.addproductPageLoad)
router.post('/products/addproduct',auth.isLogin,fileUpload.productImagesUpload,adminController.addProduct)
router.get('/products/editproduct',auth.isLogin,adminController.productEditPageLoad)
router.post('/products/editproduct',auth.isLogin,fileUpload.productImagesUpload,adminController.updateProduct)
router.get('/products/deleteproduct',auth.isLogin,adminController.deleteproduct)

// category related Routers
router.get('/category',auth.isLogin,adminController.categoryPageLoad)
router.post('/category',auth.isLogin,fileUpload.uploadCategory.single('icon'),adminController.addCategory)
router.get('/category/delete',auth.isLogin,adminController.deleteCategory)
router.get('/category/search',auth.isLogin,adminController.searchCategory)
router.post('/category/block',auth.isLogin,adminController.categoryBlock)


//orders related routers
router.get('/orders',adminController.orderPageLoad)
router.get('/orders/manage',adminController.orderMangePageLoad)
router.post('/orders/manage/cancel',adminController.cancelOrder)


//exporting
module.exports = router



