const User = require('../models/userModel')
const bcrypt = require('bcrypt')


const passwordEncrypt = async(password)=>{
    try {
        let hashedPass = await bcrypt.hash(password,10)
        return hashedPass
    } catch (error) {
        console.log(error.message);
    }
}

const homePageLoad = async(req,res)=>{
    try {
        res.render('home')
    } catch (error) {
        console.log(error.message);
    }
}

const loadSignup = async(req,res)=>{
    try {
        res.render("signup")
    } catch (error) {
        res.send(error.message)
    }
}
const loginPageLoad = async (req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const inserUser = async(req,res)=>{
    try {
        let SecurePassword = await passwordEncrypt(req.body.password)
        const user = new User({
            userName:req.body.userName,
            fullName:req.body.fullName,
            email:req.body.email,
            password:SecurePassword

        })
        const result = await user.save()
        res.send("data added in to data base..."+result)
    } catch (error) {
        res.send(error.message)
    }
} 



module.exports={
    inserUser,
    loadSignup,
    loginPageLoad,
    homePageLoad
}