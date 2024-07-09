const mongoose = require('mongoose')

const offerSchema = mongoose.Schema({
    productName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    description:{
        type: String,
        required:true
    },
    discount:{
        type: Number,
        required:true
    },
    startingDate:{
        type: Date,
        required:true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    is_activated:{
        type: Boolean,
        default: true,
        required: true
    }
})

module.exports = mongoose.model('ProductOffer',offerSchema)