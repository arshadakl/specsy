const UserDB = require('../models/userModel')
const AdminDB = require('../models/adminModel')
const bcrypt = require('bcrypt')

const adminPageLoad = async(req,res)=>{
    try {
        let users = await getAlluserData()
        // console.log(users);
        res.render('home',{users:users})
    } catch (error) {
        console.log(error.message);
    }
}
const getAlluserData = ()=>{
    return new Promise(async(resolve,reject)=>{
       let userData = await UserDB.find({})
       resolve(userData)
    })
}


const userBlock = async(req,res)=>{
    try {
        let blockStatus = await UserDB.findOne({_id:req.body.id})
        // console.log(blockStatus.block);
        if(blockStatus.block===0){
            let block = await UserDB.updateOne({_id:req.body.id},{$set:{block:1}})
        }else{
            let block = await UserDB.updateOne({_id:req.body.id},{$set:{block:0}})
        }
        
        let users = await getAlluserData()
        res.json({ users: users });

    } catch (error) {
        console.log(error.message);
    }
}

const editUserPageLoad = async(req,res)=>{
    try {
        // console.log(req.query.id);
        let userDetails = await takeOneUserData(req.query.id)
        console.log(userDetails);
        res.render('editUser',{user:userDetails})
    } catch (error) {
        console.log(error.message);
    }
}

const takeOneUserData = async(userId)=>{
    try {
        let userDetails = await UserDB.find({_id:userId})
        return userDetails
    } catch (error) {
        console.log(error.message);
    }
}


const updateUserData = async (req, res) => {
    try {
        let userData = req.body;
        // console.log(req.query.id);
        // console.log(userData);
        // console.log(req.session.user_id);
        let updateUser = await UserDB.updateOne({_id:req.query.id},{$set:{
                    userName: userData.userName,
                    fullName: userData.fullName,
                    email: userData.email,
                    "address.shippingAddress": userData.shippingAddress,
                    "address.state": userData.state,
                    "address.pincode": userData.pincode
        }})
        console.log(updateUser);
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}
const searchUsersByKey = async(key)=>{
    try {
        let userDetails = await UserDB.find({
            "$or":[
                {userName:{$regex:key}},
                {fullName:{$regex:key}},
                {email:{$regex:key}}
            ]
        })

        return userDetails
    } catch (error) {
        console.log(error.message);
    }
}

const searchUsers = async(req,res)=>{
    try {
        console.log(req.query.key);
        let users = await searchUsersByKey(req.query.key)
        res.render('home',{users:users})
    } catch (error) {
        console.log(error.message);
    }
}

const loginPageLoad = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

// const insertAdmin = async(req,res)=>{
//     try {
//         let securePass = await bcrypt.hash(req.body.password,10)
//         let admin = new AdminDB({
//             userName:req.body.userName,
//             password: securePass
//         })
        
//         let result = await admin.save()
//         console.log(result);
//         res.redirect('/')
        

//     } catch (error) {
//         console.log(error.message);
//     }
// }

const doLogin = async(req,res)=>{
    try {
        let admin = await AdminDB.findOne({userName:req.body.userName})
        // console.log(req.body.password);
        // console.log(admin);

        if(admin){
            bcrypt.compare(req.body.password,admin.password).then((status)=>{
                if(status){
                    console.log("login sucess");
                    req.session.adminloggedIn = true;
                    req.session.admin_id = admin._id
                    res.redirect('/admin')
                }else{
                    console.log("login fail");
                    req.session.adminloginErr = 1;
                    res.redirect('/admin/login')
                }
            })
        }else{
            console.log("login failed");
            req.session.adminloginErr = 1;
            res.redirect('/admin/login')
        }

    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    adminPageLoad,
    userBlock,
    editUserPageLoad,
    updateUserData,
    searchUsers,
    loginPageLoad,
    doLogin
}