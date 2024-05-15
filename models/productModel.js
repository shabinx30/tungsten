const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    categoryName:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    images:{
        type:Array,
        // validate:[arrayLimit,'{PATH} exceeds the limit of 4'],
        required:true
    },
    is_listed:{
        type:Boolean,
        required:true
    }
})


function arrayLimit (val){
    return val.length <=4
}

//model
module.exports = mongoose.model('Product',productSchema)