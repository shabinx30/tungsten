const ProductOffers = require('../models/ProductOffers')
const Product = require('../models/productModel')


//********** loding product offers */
const loadOffers = async (req,res)=>{
    try {
        const offers = await ProductOffers.find({}).populate('productName').exec()
        const products = await Product.find({is_listed: true})
        if(offers){
            const newOffferMsg = req.flash('newOffferMsg')
            res.render('ProductOfferList',{offers,newOffferMsg,products})
        }
    } catch (error) {
        console.log(error.message,'loading product offers');
        res.status(400).send(error.message)
    }
}


const addOffer = async (req,res)=>{
    try {
        const { productName,description,discount,startingDate,expiryDate } = req.body
        // console.log(productName,description,discount,startingDate,expiryDate);
        const result = new ProductOffers({
            productName,
            description,
            discount,
            startingDate,
            expiryDate,
            is_activated: true
        })
        await result.save()

        if(!result){
            req.flash('newOffferMsg', 'Address not found or not updated');
            return res.redirect('/admin/ProductOfferList');
        }
        res.redirect('/admin/ProductOfferList')
    } catch (error) {
        console.log(error.message,'adding offer');
        res.status(400).send(error.message)
    }
}

module.exports = {
    loadOffers,
    addOffer
}