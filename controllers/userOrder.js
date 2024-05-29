const Cart = require('../models/cartModel')
const User = require('../models/userModel')
const Order = require('../models/orders');

const loadCheckOut = async (req,res)=>{
    try {
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        const cart = await Cart.findOne({ userId: userId }).populate('products.productId').exec();
        if(cart){
            res.render('checkOut',{products: cart.products,name: userData.name})
        }else{
            res.render('checkOut',{products: []})
        }
 
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    loadCheckOut
}