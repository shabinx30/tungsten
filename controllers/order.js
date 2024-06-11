const Order = require('../models/orders')

const orderlist = async (req,res)=>{
    try {
        const orders = await Order.find({}).populate('orderedProducts.productId').exec();
        console.log(orders.orderedProducts);
        res.render('orderList',{orders})
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

module.exports = {
    orderlist
}