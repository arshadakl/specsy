const express = require('express')
const router = express()
const bodyParser = require("body-parser")


router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))

router.set('view engine', 'ejs');
router.set('views','./views')

const userController = require("../controllers/userController")


router.get('/home',userController.homePageLoad)
router.get('/signup',userController.loadSignup)
router.post("/signup",userController.inserUser)
router.get('/login',userController.loginPageLoad)

module.exports = router