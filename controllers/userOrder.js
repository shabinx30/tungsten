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
        if(cart){
            if(address){
                res.render('checkOut',{products: cart.products,name: userData.name,addresses: address.addresses})
            }
            else{
                res.render('checkOut',{products: cart.products,name: userData.name,addresses:[]})
            }
        }else{
            res.render('checkOut',{products: [],addresses: [],name:userData.name})
        }
 
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

const placeOrder = async (req,res)=>{
    try {
        const {selected_address} = req.body
        console.log(selected_address);
        // const address = await Address.findOne({addresses:{$elemMatch:{_id:selected_address}}})
        const cart = await Cart.findOne({userId: req.session.user_id})
        const address = await Address.findOne(
            {
              "addresses._id": selected_address
            },
            {
              "addresses.$": 1
            }
          );
        console.log(address);
        
        const order = new Order({
            userId: req.session.user_id,
            userName: address.first_name,
            shipAddress:[{
                address_type: address.address_type,
                first_name: address.first_name,
                last_name: address.last_name,
                contry: address.contry,
                street_name: address.street_name,
                town: address.town,
                state: address.state,
                postcode: address.postcode,
                phone_number: address.phone_number,
                email: address.email
            }],
        })
        res.render('orderSuccess')
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

module.exports={
    loadCheckOut,
    placeOrder
}