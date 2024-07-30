const Cart = require('../models/cartModel')
const User = require('../models/userModel')
const Order = require('../models/orders');
const Address = require('../models/addresses')
const Product = require('../models/productModel')
const { format } = require('date-fns');
const userHelper = require('../helpers/user-helper')
const walletController = require('../controllers/walletController')
const Wallet = require('../models/wallet')
const Coupon = require('../models/couponModel')



//load checkout page
const loadCheckOut = async (req,res)=>{
    try {
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        const cart = await Cart.findOne({ userId: userId }).populate('products.productId').exec();
        const address = await Address.findOne({userId: userId})
        
        let total = 0

        if(cart){
            cart.products.forEach((val)=>{
                total+=val.productId.price*val.quantity
            })
        }

        // coupon
        const coupon = await Coupon.aggregate([
            {
                $match: {
                    is_activated: true,
                    claimed: false
                }
            },
            {
                $addFields: {
                    comparisonResult: { $gte: [total, "$cryteriaAmount"] }
                }
            },
            {
                $match: {
                    comparisonResult: true
                }
            },
            {
                $project: {
                    comparisonResult: 0
                }
            }
        ]);

        console.log(coupon);

        if(cart){
            if(address){
                res.render('checkOut',{products: cart.products,name: userData.name,addresses: address.addresses,coupon: coupon.length>0 ? coupon : []})
            }
            else{
                res.render('checkOut',{products: cart.products,name: userData.name,addresses:[],coupon: coupon.length>0 ? coupon : []})
            }
        }else{
            res.render('checkOut',{products: [],addresses: [],name:userData.name,coupon: coupon.length>0 ? coupon : []})
        }
 
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}


const placeOrder = async (req, res) => {
    try {
        const { selected_address,paymentMethod,coupon } = req.body;
        const userId = req.session.user_id;
        // console.log(req.body);
        if (!paymentMethod) {
            throw new Error('Payment method is required');
        }

        // Fetch the cart for the current user
        const cart = await Cart.findOne({ userId });

        if (!cart || !cart.products || cart.products.length === 0) {
            throw new Error('Cart is empty');
        }

        // Fetch the selected address
        const addressDoc = await Address.findOne(
            { "addresses._id": selected_address },
            { "addresses.$": 1 }
        );

        if (!addressDoc || !addressDoc.addresses || addressDoc.addresses.length === 0) {
            throw new Error('Address not found');
        }

        const address = addressDoc.addresses[0];

        // Fetch product details
        const orderedProducts = await Promise.all(cart.products.map(async item => {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            const price = product.finalPrice;
            if (typeof price !== 'number') {
                throw new Error(`Invalid price for product ID ${item.productId}`);
            }
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: price,
                totalPrice: price * item.quantity,
                status: 'placed'
            };
        }));

        // Calculate subtotal
        const subTotal = orderedProducts.reduce((sum, item) => sum + item.totalPrice, 0);

        // Store the current date in the format 
        const purchasedDate = format(new Date(), 'dd/MM/yy, hh:mm a');
        const orderId = userHelper.orderIdgenerator()
        // Create order object
        const order = new Order({
            userId,
            orderId,
            userName: `${address.first_name} ${address.last_name}`,
            shipAddress: [{
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
            orderedProducts,
            purchasedDate, 
            paymentMethod,
            paymentStatus: false,
            subTotal
        });

        

        if(paymentMethod=='cash'){
            res.json({result:'redirect',location:'/orderSuccess'})

            await order.save();

            await Cart.deleteOne({ userId });

        }else if(paymentMethod=='online'){
            console.log('chosen online payment');
            let result = await userHelper.razorpayRes(subTotal,orderId)
            console.log('from user helper:',result);

            await order.save();

            await Cart.deleteOne({ userId });
            res.json({result})
        }else{
            let result = await walletController.paymentWithWallet(subTotal,userId)
            console.log(result,'wallet Controller');
            if(result.success==true){

                await order.save();

                await Cart.deleteOne({ userId });
                
                res.json({success: true,location: '/orderSuccess'})
                console.log(true);
            }else if(result.success==false){
                console.log(false);
                res.json({success: false,error: result.error})
            }
        }
    } catch (error) {
        console.log(error.message,'from place order');
        res.status(400).send(error.message);
    }
};


const orderSuccess = async (req,res)=>{
    try {
        res.render('orderSuccess');
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
}


const removeFromOrders = async (req, res) => {
    try {
        const { productId } = req.query;
        console.log(productId, 'remove');

        const result = await Order.findOneAndUpdate(
            { "orderedProducts._id": productId },
            { $set: { "orderedProducts.$.status": 'cancelled' } },
            { new: true }
        );

        if (result) {
            const orderedProduct = result.orderedProducts.find(product => product._id.toString() === productId);
            if (orderedProduct && (result.paymentMethod === 'wallet' || result.paymentMethod === 'online')) {
                const amount = orderedProduct.price;
                console.log(amount);

                const date = format(new Date(), 'dd/MM/yy, hh:mm a');

                const wallet = await Wallet.findOneAndUpdate(
                    { userId: req.session.user_id },
                    {   $inc: { balance: amount },
                        $addToSet: {
                            transactionHistory: {
                                amount,
                                date,
                                paymentMethod: 'cancell amount',
                                status: 'credit'
                            }
                        }
                    },
                    { new: true }
                );

                console.log(wallet); // log wallet to see if the update was successful
            }

            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
};

const verifyPayment = async (req,res)=>{
    try {
        const { orderId } = req.body
        console.log('coming',orderId);
        const status = await Order.findOneAndUpdate({orderId: orderId},{paymentStatus: true})
        console.log('status changing',status);
        res.json({status: status? true:false,redirect: '/orderSuccess'})

    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
}

module.exports={
    loadCheckOut,
    placeOrder,
    removeFromOrders,
    orderSuccess,
    verifyPayment
}