const Return = require('../models/returnModel')
const Order = require('../models/orders')
const mongoose = require('mongoose')
const { format } = require('date-fns');

//       creating new retrun and updating in order
const returnProduct = async (req,res)=>{
    try {
        const {productId,reason,_id} = req.body
        // console.log(productId,_id);
        const objectId = new mongoose.Types.ObjectId(_id);
        

        const result = await Order.findOneAndUpdate(
            { "orderedProducts._id": _id },
            { $set: { "orderedProducts.$.status": 'pending' } },
            { new: true }
        );

        const product = await Order.aggregate([
            { $match: { "orderedProducts._id": objectId } },
            { $addFields: {
                orderedProducts: {
                    $filter: {
                        input: "$orderedProducts",
                        as: "item",
                        cond: { $eq: ["$$item._id", objectId] }
                    }
                }
            }}
        ]);

        // console.log('result Data',product[0]);
        // console.log('address',product.shipAddress);
        
        

        if(result){
            const newRetrun = new Return({
                reason,
                userId: product[0].userId,
                orderId: product[0].orderId,
                userName: product[0].userName,
                shipAddress: product[0].shipAddress[0],
                orderedProducts: product[0].orderedProducts[0],
                purchasedDate: product[0].purchasedDate,
                returnedDate: format(new Date(), 'dd/MM/yy, hh:mm a'),
                paymentMethod: product[0].paymentMethod,
                paymentStatus: product[0].paymentStatus
            })
    
            await newRetrun.save()
        }

        res.redirect('/userDashboard')
    } catch (error) {
        console.log(error,'from return product');
    }
}


//             loding return page
const loadReturn = async (req, res) => {
    try {
      const returnData = await Return.find({}).populate('orderedProducts.productId')
    //   console.log("Populated Return Data:", returnData);
  
      let page = 0;
      res.render('returnList', { returnData, page });
    } catch (error) {
      console.error('Error loading the return page:', error);
    }
};

module.exports = {
    returnProduct,
    loadReturn,
}