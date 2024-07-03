const mongoose = require('mongoose')

const offerSchema = mongoose.Schema({
    offerName: {
        type: String,
        required: true,
    },
    description:{
        type:String,
        required:true
    },
    offPercentage:{
        type:Number,
        required:true
    },
    type:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Offer',offerSchema)