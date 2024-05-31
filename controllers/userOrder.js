const Cart = require('../models/cartModel')
const User = require('../models/userModel')
const Order = require('../models/orders');
const Address = require('../models/addresses')

const loadCheckOut = async (req,res)=>{
    try {
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        const cart = await Cart.findOne({ userId: userId }).populate('products.productId').exec();
        const address = await Address.findOne({userId: userId})
        if(cart&&address){
            res.render('checkOut',{products: cart.products,name: userData.name,addresses: address.addresses})
        }else{
            res.render('checkOut',{products: [],addresses: []})
        }
 
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    loadCheckOut
}