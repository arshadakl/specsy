const multer = require('multer')
const path = require('path')

// user profile avatar upload
const storage = multer.diskStorage({
    destination:function(req,file,callbacks){
        callbacks(null,path.join(__dirname, '../public/user/images/userImages'))
    },
    filename:function(req,file,callbacks){
        const  name = Date.now()+"-"+file.originalname;
        callbacks(null,name)
    }
})

const upload = multer({storage:storage})

// // product uploads
// var storageProduct = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, path.join(__dirname,"../public/products/images"));
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
//     },
//   });
  
// const uploadProduct = multer({ storage: storageProduct });
// const productImagesUpload = uploadProduct.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 },{ name: 'image3', maxCount: 1 },{ name: 'image4', maxCount: 1 }])

const storageProduct = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/products/images'));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Custom file filter function to allow only image files
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept the file
  } else {
    const error = new Error('Only image files are allowed!');
    // error.redirectTo = '/admin/error-page'; 
    // cb(error, false);
  }
};
const uploadProduct = multer({
  storage: storageProduct,
  fileFilter: imageFileFilter, // Apply the custom file filter
});

const productImagesUpload = uploadProduct.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
]);


// category icon adding 
const storageCategory = multer.diskStorage({
    destination:function(req,file,callbacks){
        callbacks(null,path.join(__dirname, '../public/products/icons'))
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
  })
  
  const uploadCategory = multer({storage:storageCategory})
  

module.exports={
    upload,
    productImagesUpload,
    uploadCategory
}