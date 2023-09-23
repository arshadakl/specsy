const express = require('express')
const router = express()
const bodyParser = require("body-parser")


router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.set('view engine', 'ejs');
router.set('views','./views')

const userController = require("../controllers/userController")


router.get('/',userController.homePageLoad)

router.get('/signup',userController.loadSignup)
router.post("/signup",userController.inserUser)

router.get('/login',userController.loginPageLoad)
router.post('/login',userController.doLogin)

router.get('/logout',userController.doLogout)


router.get('/product',userController.productPageLoad)

router.get('/otp',userController.optPageLoad)
router.post('/otp',userController.otpValid)

router.get('/reotp',userController.reVerifyUser)

router.get('/profile',userController.profilePageLoad)

router.get('/verifypage',userController.verifyPageLoad)


module.exports = router