const Order = require('../models/orders')

const orderlist = async (req,res)=>{
    try {
        const orders = await Order.find({}).sort({_id: -1}).populate('orderedProducts.productId').exec();
        // console.log(orders.orderedProducts);
        res.render('orderList',{orders})
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

const changeStatus = async (req,res)=>{
    try {
        const { status,productId } = req.body
        console.log('status',status);
        const result = await Order.findOneAndUpdate(
            { "orderedProducts._id": productId },
            { $set: { "orderedProducts.$.status": status } },
            { new: true }
        );
        console.log(result);
        if(result){
            res.json(true)
        }else{
            res.json(false)
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

module.exports = {
    orderlist,
    changeStatus
}