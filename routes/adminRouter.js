const express = require('express')
const router = express()
const bodyParser = require("body-parser")
const multer = require('multer')
const path = require('path')

const adminController = require('../controllers/adminController')
const productController = require('../controllers/productsController')
const categoryController = require('../controllers/categoryController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const reportController = require('../controllers/reportController')

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
router.get('/users',auth.isLogin,adminController.usersPageLoad)


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
router.get('/products',auth.isLogin,productController.productPageLoad)
router.get('/products/searchproduct',auth.isLogin,productController.searchproduct)
router.get('/products/addproduct',auth.isLogin,productController.addproductPageLoad)
router.post('/products/addproduct',auth.isLogin,fileUpload.productImagesUpload,productController.addProduct)
router.get('/products/editproduct',auth.isLogin,productController.productEditPageLoad)
router.post('/products/editproduct',auth.isLogin,fileUpload.productImagesUpload,productController.updateProduct)
router.get('/products/deleteproduct',auth.isLogin,productController.deleteproduct)

// category related Routers
router.get('/category',auth.isLogin,categoryController.categoryPageLoad)
router.post('/category',auth.isLogin,fileUpload.uploadCategory.single('icon'),categoryController.addCategory)
router.get('/category/delete',auth.isLogin,categoryController.deleteCategory)
router.get('/category/search',auth.isLogin,categoryController.searchCategory)
router.post('/category/block',auth.isLogin,categoryController.categoryBlock)


//orders related routers
router.get('/orders',auth.isLogin,orderController.orderPageLoad)
router.get('/orders/manage',auth.isLogin,orderController.orderMangePageLoad)
router.post('/orders/manage/cancel',auth.isLogin,orderController.cancelOrder)
router.post('/orders/manage/changestatus',auth.isLogin,orderController.changeOrderStatus)

//coupon related routers
router.get('/coupon',auth.isLogin,couponController.couponPageLoad)
router.get('/coupon/add',auth.isLogin,couponController.addCouponPageLoad)
router.post('/coupon/add',auth.isLogin,couponController.addNewCoupon)
router.get('/coupon/delete',auth.isLogin,couponController.deleteCoupon)

//report make related routers
router.post('/report/genarate',auth.jsonIsLogin,adminController.genarateSalesReports)
router.get('/sales-report',auth.isLogin,reportController.salesReportPageLoad)
// router.get('/sales-report/filter',reportController.salesReportSearchPageLoad)
router.post('/sales-report/portfolio',auth.isLogin,reportController.portfolioFiltering)

router.get('/sales-report/export-report',auth.isLogin,reportController.generateExcelReports)
router.get('/sales-report/export-PDF-report',auth.isLogin,reportController.generatePDFReports)


router.get('/admin/error-page',adminController.errorpageHandil)

//exporting
module.exports = router



