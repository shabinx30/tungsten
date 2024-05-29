const mongoose = require('mongoose')

const addressSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    addresses:[{
        address_type:{
            type: String,
            required: true
        },
        address:{
            type:String,
            required: true
        }
    }]
})

module.exports = mongoose.model('Address',addressSchema)