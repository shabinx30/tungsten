const Cart = require('../models/cartModel');
const Product = require('../models/productModel')

//loadCart
const loadCart = async (req, res) => {
    try {
        const userId = req.session.user_id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not logged in' });
        }

        const cart = await Cart.findOne({ userId: userId }).populate('products.productId').exec();

        if (!cart) {
            return res.render('cart', { cart: [], products: [] });
        }
        // console.log(userId)
        

        res.render('cart', {products: cart.products });
    } catch (error) {
        console.error('Error loading cart:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

//addto Cart
const addCart = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { productId,quantity } = req.body
        const userExist =  await Cart.findOne({userId: userId})
        if(!userExist){
            const userCart = new Cart({
                userId: userId,
                products: [
                    {
                        productId: productId,
                        quantity: quantity
                    }
                ]
            });
            await userCart.save()
            res.json({success: true})
        }
        else{
            const result = await Cart.findOne({
                userId: userId,
                products: {
                    $elemMatch: {
                        productId: productId
                    }
                }
            })
            if(!result){
                const available = await Product.findOne({_id:productId})
                if(available.quantity!=0){
                    const cart = await Cart.findOneAndUpdate({userId: userId},{$addToSet:{products:{productId:productId,quantity:quantity}}})
                    if(cart) res.json({success: true})
                }else{
                   res.json({success: false,error: "Out of stock"}) 
                }
                    
            }else{
                res.json({success: false})
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};

//remove from the cart
const removeProductFromCart = async (req,res)=> {
    try {
        console.log('kk');
        const userId = req.session.user_id;
        const { productId } = req.body
        const cart = await Cart.findOneAndUpdate({userId: userId},{ $pull: { products: { productId: productId } } })
        if(cart){
            res.json({success: true})
        }else{
            res.json({success: false})
        }
    } catch (error) {
        console.log(error.message);
    }
}

//changing the quantity
const quantity = async(req,res)=>{
    try {
        // console.log('increase');
        const userId = req.session.user_id;
        const { productId,quantity } = req.body;
        // console.log(quantity);
        const cart = await Cart.findOneAndUpdate(
            { userId: userId, 'products.productId': productId }, 
            { $set: { 'products.$.quantity': quantity } }, 
            { new: true }
        );
        if(cart){
            const products = await Cart.findOne({ userId: userId }).populate('products.productId').exec();
            res.json({success:true,quantity:quantity,products: products.products})
        }else{
            res.json({success:false})
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCart,
    addCart,
    removeProductFromCart,
    quantity
}