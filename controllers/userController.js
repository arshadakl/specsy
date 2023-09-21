const User = require('../models/userModel')

const inserUser = async(req,res)=>{
    try {
        const user = new User({
            userName:req.body.userName,
            fullName:req.body.fullName,
            email:req.body.email,
            password:req.body.password

        })
        const result = await user.save()
        res.send("data added in to data base..."+result)
    } catch (error) {
        res.send(error.message)
    }
} 

module.exports={
    inserUser
}