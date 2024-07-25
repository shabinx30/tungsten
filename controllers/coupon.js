const Coupon = require('../models/couponModel')

const ListConpon = async (req,res)=>{
    try {
        const coupons = await Coupon.find({})
        res.render('coupon',{coupons})
    } catch (error) {
        console.log(error,'from listing coupon');
    }
}

const addCoupon = async(req, res) => {
    try {
        const { couponCode, discount, cryteriaAmount, expiryDate } = req.body;

        console.log(couponCode, discount, cryteriaAmount, expiryDate);

        const result = new Coupon({
            couponCode,
            discount,
            cryteriaAmount,
            expiryDate,
            is_activated: true
        });
        await result.save();

        res.redirect('/admin/couponList');
    } catch (error) {
        console.log(error, 'from adding coupon');
    }
};



module.exports = {
    ListConpon,
    addCoupon
}