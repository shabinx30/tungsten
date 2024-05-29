const mongoose = require('mongoose')

const OrderSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Orders:[{
        
    }]
});

module.exports = mongoose.model('Oder',OrderSchema)