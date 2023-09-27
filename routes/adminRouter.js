const express = require('express')
const router = express()
const bodyParser = require("body-parser")
const multer = require('multer')
const path = require('path')
const adminController = require('../controllers/adminController')
const auth = require('../middleware/admin')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))


router.set('view engine', 'ejs');
router.set('views','./views/admin')


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,"../public/products/images"));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
const productImagesUpload = upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 },{ name: 'image3', maxCount: 1 },{ name: 'image4', maxCount: 1 }])


// routers 

router.get('/',auth.isLogin,adminController.adminPageLoad)
router.post('/blockuser',auth.isLogin,adminController.userBlock)

router.get('/edituser',auth.isLogin,adminController.editUserPageLoad)
router.post('/edituser',auth.isLogin,adminController.updateUserData)

router.get('/searchUsers',auth.isLogin,adminController.searchUsers)

router.get('/login',auth.isLogout,adminController.loginPageLoad)
router.post('/login',auth.isLogout,adminController.doLogin)
router.get('/logout',auth.isLogin,adminController.adminLogOut)

router.get('/products',adminController.productPageLoad)
router.get('/products/addproduct',auth.isLogin,adminController.addproductPageLoad)

router.post('/products/addproduct',auth.isLogin,productImagesUpload,adminController.addProduct)

router.get('/products/editproduct',adminController.productEditPageLoad)
router.get('/products/searchproduct',adminController.searchproduct)


module.exports = router