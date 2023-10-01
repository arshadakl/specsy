const UserDB = require('../models/userModel')
const AdminDB = require('../models/adminModel')
const ProductDB = require('../models/productsModel').product
const CategoryDB = require('../models/productsModel').category
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

const getProductDetails = async(id)=>{
    try {
        let product = await ProductDB.find({_id:id})
        return product[0]
    } catch (error) {
        console.log(error.message);
    }
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

const productSearchByKey = async(key)=>{
    try {
        console.log("search api called...");
        // console.log(key);
        let products = await ProductDB.find({
            "$or": [
              { product_name: { $regex: key, $options: 'i' } },
              { frame_shape: { $regex: key, $options: 'i' } }
            ]
          })
          
        // console.log(products);
        return products
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

// const loginPageLoad = async (req, res) => {
//     try {
//         res.render('login', {
//             adminloginErr: req.session.adminloginErr
//         });

//         // Set req.session.adminloginErr to 0 after rendering the page
//         req.session.adminloginErr = 0;
//     } catch (error) {
//         console.log(error.message);
//     }
// }


const loginPageLoad = async (req, res) => {
    try {
      res.render(
        "login",
        {
          adminloginErr: req.session.adminloginErr
        },
        (err, html) => {
          if (!err) {
            // Set adminloginErr to false after rendering
            req.session.adminloginErr = false;
  
            res.send(html); // Send the rendered HTML to the client
          } else {
            console.log(err.message);
          }
        }
      );
    } catch (error) {
      console.log(error.message);
    }
  };
  

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

const adminLogOut = async(req,res)=>{
    try {
        req.session.adminloggedIn = false;
        req.session.admin_id = null
        console.log("admin logouted...");
        res.redirect('/admin/login')
    } catch (error) {
        console.log(error.message);
    }
}

const productPageLoad = async(req,res)=>{
    try {
        let products = await ProductDB.find({})
        // console.log(products);
        res.render('products',{products:products})
    } catch (error) {
        console.log(error.message);
    }
}

const addproductPageLoad = async(req,res)=>{
    try {
        let categories = await CategoryDB.find({})
        res.render('addProduct',{categories:categories})
    } catch (error) {
        console.log(error.message);
    }
}

const addProduct = async(req,res)=>{
    try {
       let details = req.body
       const files = await req.files;
       console.log(files);
       console.log(files.image1[0].filename,files.image2[0].filename,files.image3[0].filename,files.image4[0].filename);
       let product = new ProductDB({
          product_name:details.product_name,
          price:details.price,
          frame_shape:details.frame_shape,
          gender:details.gender,
          description:details.description,
          stock:details.stock,
          "images.image1":files.image1[0].filename,
          "images.image2":files.image2[0].filename,
          "images.image3":files.image3[0].filename,
          "images.image4":files.image4[0].filename
       })

       let result = await product.save()
       console.log(result);
       res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message);
    }
}

const productEditPageLoad = async(req,res)=>{
    try {
        
        let product = await getProductDetails(req.query.id)
        let categories = await CategoryDB.find({})
        res.render('editProduct',{product:product,categories:categories})
    } catch (error) {
        console.log(error.message);
    }
}

const searchproduct = async(req,res)=>{
    try {
        // console.log(req.query.key);  
        let products = await productSearchByKey(req.query.key)
        // console.log(products);
        res.render('products',{products:products})
    } catch (error) {
        console.log(error.message);
    }
}



const updateProduct = async (req, res) => {
    try {
      let details = req.body;
      let imagesFiles = req.files;
      let currentData = await getProductDetails(req.query.id);
  
      let img1, img2, img3, img4;
  
      img1 = imagesFiles.image1 ? imagesFiles.image1[0].filename : currentData.images.image1;
      img2 = imagesFiles.image2 ? imagesFiles.image2[0].filename : currentData.images.image2;
      img3 = imagesFiles.image3 ? imagesFiles.image3[0].filename : currentData.images.image3;
      img4 = imagesFiles.image4 ? imagesFiles.image4[0].filename : currentData.images.image4;
  
      let update = await ProductDB.updateOne(
        { _id: req.query.id }, 
        {
          $set: {
            product_name: details.product_name,
            price: details.price,
            frame_shape: details.frame_shape,
            gender: details.gender,
            description: details.description,
            stock: details.stock,
            "images.image1": img1,
            "images.image2": img2,
            "images.image3": img3,
            "images.image4": img4
          }
        }
      );
  
      console.log(update);
  
      res.redirect('/admin/products');
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const deleteproduct = async(req,res)=>{
    try {
        console.log(req.query.id);
        let removeProduct = await ProductDB.deleteOne({_id:req.query.id})
        console.log(removeProduct);
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message);
    }
  }

const categoryPageLoad = async(req,res)=>{
    try {
        let categories = await CategoryDB.find({})
        // console.log(categories);
        res.render('category',{categories:categories})
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async(req,res)=>{
    try {
        console.log(req.body);
        let currentDate = new Date();
        let img = await req.file.filename
        console.log(img);
        let category = new CategoryDB({
            category_name:req.body.category_name,
            icon:img,
            createdAt:currentDate.toLocaleString(),
            block:0
        })

        let result = await category.save()
        console.log(result);
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }
}


const deleteCategory = async(req,res)=>{
    try {
        let deleteItem = await CategoryDB.deleteOne({_id:req.query.id})
        console.log(deleteItem);
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }
}

const searchCategory = async(req,res)=>{
    try {
        let categories = await CategoryDB.find({category_name:{$regex:req.query.key, $options: 'i'}})
        console.log(categories);
        res.render('category',{categories:categories})
    } catch (error) {
        console.log(error.message);
    }
}


const categoryBlock = async(req,res)=>{
    try {
        // console.log("back end called........");
        let blockStatus = await CategoryDB.findOne({_id:req.body.id})
        console.log(blockStatus.block);

        if(blockStatus.block==0){
            let block = await CategoryDB.updateOne({_id:req.body.id},{$set:{block:1}})
        }else{
            let block = await CategoryDB.updateOne({_id:req.body.id},{$set:{block:0}})
        }
        
        let categories = await CategoryDB.find({})
        res.json({ categories:categories });

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
    doLogin,
    adminLogOut,
    productPageLoad,
    addproductPageLoad,
    addProduct,
    productEditPageLoad,
    searchproduct,
    updateProduct,
    deleteproduct,
    categoryPageLoad,
    addCategory,
    deleteCategory,
    searchCategory,
    categoryBlock
}