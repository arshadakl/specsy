const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const nodemiler = require('nodemailer')
let otp = null


const passwordEncrypt = async(password)=>{
    try {
        let hashedPass = await bcrypt.hash(password,10)
        return hashedPass
    } catch (error) {
        console.log(error.message);
    }
}
// send mail
const generateOTP=(length = 6)=> {
	return [...new Array(length)].reduce(function (a) {
		return a + Math.floor(Math.random() * 10);
	}, "");
}
// send mail
const sentVerifyMail = async(name,email,userId)=>{
    try {
        otp = generateOTP()
        const transporter = nodemiler.createTransport({
            host:"smtp.gmail.com",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:"miraclexweb@gmail.com",
                pass:"uzho cupm wiea xiwd"
            }
        })
        const mailOptions = {
            from:"miraclexweb@gmail.com",
            to:email,
            subject:"For veryfication email",
            html:`<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
              <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Specsy</a>
              </div>
              <p style="font-size:1.1em">Hi, ${name}</p>
              <p>Thank you for choosing Specsy frame store. Use the following OTP to complete your Sign Up procedures. OTP is valid for 2 minutes</p>
              <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
              <p style="font-size:0.9em;">Regards,<br />Specsy</p>
              <hr style="border:none;border-top:1px solid #eee" />
              <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                <p>specsy</p>
                <p>Kerala</p>
              </div>
            </div>
          </div>`
        }
        transporter.sendMail(mailOptions,((error,info)=>{
            if(error){
                console.log(error);
            }else{
                console.log("Email ented ",info.response);

                
            }
        }))
    } catch (error) {
        console.log(error.message);
    }
}

const homePageLoad = async(req,res)=>{
    try {
        if(req.session.user){
            console.log(req.session.user.userName);
        }else{
            console.log("no user...");
        }
        res.render('home',{user:req.session.user})
        
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
// const loginPageLoad = async (req,res)=>{
//     try {
//         let user = req.session.user
//         user ? res.redirect('/') :
//         req.session.loginErr ? console.log("login error und") : null
//         res.render('login',{
//             loginErr:req.session.loginErr
//         })
//         req.session.loginErr=false
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const loginPageLoad = async (req, res) => {
    try {
        let user = req.session.user;
        user ? res.redirect('/') :
        req.session.loginErr ? console.log("login error und") : null;

        res.render('login', {loginErr: req.session.loginErr}, (err, html) => {
            if (!err) {
                req.session.loginErr = false; // Set loginErr to false after rendering
                res.send(html); // Send the rendered HTML to the client
            } else {
                console.log(err.message);
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};


const doLogin = async(req,res)=>{
    try {
        
        let user = await User.findOne({userName:req.body.userName})
        if(user){
            bcrypt.compare(req.body.password,user.password).then((status)=>{
                if(status){
                    console.log("login success");
                    req.session.loggedIn = true;
                    req.session.user=user
                    res.redirect('/')
                    
                }else{
                    req.session.loginErr = 1;
                    res.redirect("/login");
                    console.log("login failed");
                }
            })
        }else{
            req.session.loginErr = 1;
            console.log("login failed");
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message);
    }
}

const doLogout = async(req,res)=>{
    try {
        req.session.user=null
        res.redirect('/')
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
            password:SecurePassword,
            verified:0

        })
        const result = await user.save()
        let otpVerify = await sentVerifyMail(req.body.userName,req.body.email,result._id)
        res.render('otpValid',{userId:result._id})
    } catch (error) {
        res.send(error.message)
    }
} 

const productPageLoad = async(req,res)=>{
    try {
        res.render('product')
    } catch (error) {
        console.log(error.message);
    }
}

const optPageLoad = async(req,res)=>{
    try {
        console.log("otpPage called");
        res.render("otpValid")
    } catch (error) {
        console.log(error.message);
    }
}

const reVerifyUser = async(req,res)=>{
    try {
        let userData = await takeUserData(req.query.id)
        let otpVerify = await sentVerifyMail(userData.userName,userData.email,userData._id)
        res.render('otpValid',{userId:userData.id})
    } catch (error) {
        console.log(error.message);
    }
}

const otpValid = async(req,res)=>{
    try {
        console.log(req.query.id);
        let num=req.body
        enterdOtp=""+num.a+num.b+num.c+num.d+num.e+num.f
        if(enterdOtp==otp){
            console.log("otp correct");
             let updatInfo = await User.updateOne({_id:req.query.id},{$set:{verified:1}})
             console.log(updatInfo);
             res.render('verifyNotfy',{wrong:0})
        }else{
            res.render('verifyNotfy',{userId:req.query.id,wrong:1})
            console.log("otp wrong");
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const profilePageLoad = async(req,res)=>{
    try {
        res.render('userProfile',{user:req.session.user})
    } catch (error) {
        console.log(error.message);
    }
}
const verifyPageLoad = async(req,res)=>{
    try {
        res.render('verifyNotfy')
    } catch (error) {
        console.log(error.message);
    }
}

const takeUserData = async(userId)=>{
    try {
        return new Promise((resolve,reject)=>{
            User.findOne({_id:userId}).then((response)=>{
                resolve(response)
            })
        })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    inserUser,
    loadSignup,
    loginPageLoad,
    homePageLoad,
    productPageLoad,
    optPageLoad,
    otpValid,
    doLogin,
    doLogout,
    profilePageLoad,
    verifyPageLoad,
    reVerifyUser
}