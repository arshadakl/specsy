const express = require('express')
const router = express()
const bodyParser = require("body-parser")
const multer = require('multer')
const path = require('path')
const adminController = require('../controllers/adminController')
const auth = require('../middleware/adminAuth')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))


router.set('view engine', 'ejs');
router.set('views','./views/admin')


router.get('/',auth.isLogin,adminController.adminPageLoad)
router.post('/blockuser',auth.isLogin,adminController.userBlock)

router.get('/edituser',auth.isLogin,adminController.editUserPageLoad)
router.post('/edituser',auth.isLogin,adminController.updateUserData)

router.get('/searchUsers',auth.isLogin,adminController.searchUsers)

router.get('/login',auth.isLogout,adminController.loginPageLoad)
router.post('/login',auth.isLogout,adminController.doLogin)

module.exports = router