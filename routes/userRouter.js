const express = require('express')
const router = express()
const bodyParser = require("body-parser")
const multer = require('multer')
const path = require('path')
const auth = require("../middleware/user")


router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))


router.set('view engine', 'ejs');
router.set('views','./views/user/')

const userController = require("../controllers/userController")

const storage = multer.diskStorage({
    destination:function(req,file,callbacks){
        callbacks(null,path.join(__dirname, '../public/user/images/userImages'))
    },
    filename:function(req,file,callbacks){
        const  name = Date.now()+"-"+file.originalname;
        callbacks(null,name)
    }
})

const upload = multer({storage:storage})


router.get('/',userController.homePageLoad)

router.get('/signup',auth.isLogout,userController.loadSignup)
router.post("/signup",auth.isLogout,userController.inserUser)

router.get('/login',auth.isLogout,userController.loginPageLoad)
router.post('/login',auth.isLogout,userController.doLogin)
router.get('/logout',userController.doLogout)

router.get('/product',userController.productPageLoad)

router.get('/otp',userController.optPageLoad)
router.post('/otp',userController.otpValid)

router.get('/reotp',userController.reVerifyUser)
router.get('/verifypage',userController.verifyPageLoad)


router.get('/profile',auth.isLogin,userController.profilePageLoad)
router.post('/updateUser',auth.isLogin,userController.updateUserData)
router.post('/updatePhoto',auth.isLogin,upload.single("image"),userController.updatePhoto)



module.exports = router