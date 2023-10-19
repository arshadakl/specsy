

const isLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id){}
        else{
           return res.redirect('/login')
        }
        next()

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

//json requies validations
const jsonIsLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id){}
        else{
           return res.json({auth:0})
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){
           return res.redirect('/')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}



module.exports ={
    isLogin,
    isLogout,
    jsonIsLogin
}