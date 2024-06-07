const Order = require('../models/orders')

const orderlist = async (req,res)=>{
    try {
        const orders = await Order.find({})
        res.render('orderList',{orders})
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

module.exports = {
    orderlist
}