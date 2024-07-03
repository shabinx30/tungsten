const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({
    coupenName: {
        type: String,
        required: true
    },
    coupenCode: {
        type: String,
        required: true
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    activationDate: {
        type: Date,

    },
    expiryDate: {
        type: Date,
        required: true
    },
    cryteriaAmount: {
        type: Number,
        required: true
    },
    claimed: {
        type: Boolean,
        default: false

    }
})

module.exports = mongoose.model('Coupon',couponSchema)