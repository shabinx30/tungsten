const mongoose = require('mongoose')

const categoryschema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    is_listed:{
        type:Boolean,
        default:false
    }
},{versionKey:false});

// model
module.exports = mongoose.model('Category',categoryschema)