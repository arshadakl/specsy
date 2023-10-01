const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    product_name:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    frame_shape:{
        type:String,
        require:true
    },
    gender:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    stock:{
        type:Number,
        require:true
    },
    images:{
        image1:{
            type:String,
            require:true
        },
        image2:{
            type:String,
            require:true
        },
        image3:{
            type:String,
            require:true
        },
        image4:{
            type:String,
            require:true
        }
    }
})

const categorySchema = mongoose.Schema({
    category_name:{
        type:String,
        require:true
    },
    createdAt:{
        type:String,
        require:true
    },
    icon:{
        type:String,
        require:true
    },
    block:{
        type:String,
        require:true
    }
})

const category = mongoose.model('category',categorySchema)

const product = mongoose.model("product",productSchema)
module.exports = {
    product,
    category
}