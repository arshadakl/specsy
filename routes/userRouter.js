const express = require('express')
const router = express()
const bodyParser = require("body-parser")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'hbs');
app.set('views','../views')

const userController = require("../controllers/userController")

app.get('/signup',(req,res)=>{
    res.render('signup')
})

app.post("/signup",userController.inserUser)

module.exports = app