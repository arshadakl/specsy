



const isLogin = async(req,res,next)=>{
    try {
        if(req.session.admin_id){}
        else{
            res.redirect('/admin/login')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            res.redirect('/')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}
// image uploads


module.exports = {
    isLogin,
    isLogout
}