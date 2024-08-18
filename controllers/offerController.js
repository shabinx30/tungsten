const ProductOffers = require('../models/ProductOffers')
const CategoryOffer = require('../models/categoryOffer')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')


//********** loding product offers */
const loadProductOffers = async (req,res)=>{
    try {
        const offers = await ProductOffers.find({}).populate('productName').exec()
        const products = await Product.find({is_listed: true})
        if(offers){
            const newOffferMsg = req.flash('newOfferMsg')
            res.render('ProductOfferList',{offers,newOffferMsg,products})
        }
    } catch (error) {
        console.log(error.message,'loading product offers');
        res.status(400).send(error.message)
    }
}


const addOffer = async (req,res)=>{
    try {
        const { productName,description,discount,expiryDate } = req.body
        // console.log(startingDate,expiryDate);

        const exist = await ProductOffers.findOne({productName})
        if(exist){
            req.flash('newOfferMsg','This offer is already existing...!!!')
            return res.redirect('/admin/ProductOfferList')
        }
        
        const result = new ProductOffers({
            productName,
            description,
            discount,
            expiryDate,
            is_activated: true
        })
        await result.save()

        // const productData = await Product.findOne({_id: productName})
        // let productDiscount = productData.price*parseInt(discount)/100
        // if(productData.offer<discount){
        //     await Product.findOneAndUpdate({_id: productName},{$set: {finalPrice: productDiscount,offer}})
        //     console.log('offer updated');
        // }

        if(!result){
            req.flash('newOffferMsg', 'Data not found or not updated');
            return res.redirect('/admin/ProductOfferList');
        }
        res.redirect('/admin/ProductOfferList')
    } catch (error) {
        console.log(error.message,'adding offer');
        res.status(400).send(error.message)
    }
}


//load category offer page
const loadCategoryOffers = async (req,res)=>{
    try {
        const categoryOffers = await CategoryOffer.find({}).populate('categoryId')
        const categories = await Category.find({is_listed: true})

        res.render('categoryOfferList',{categoryOffers,categories})
    } catch (error) {
        console.log(error.message,'listing category offers');
        res.status(400).send(error.message)
    }
}

//add category offer
const addCategoryOffer = async (req, res) => {
    try {
        const { categoryId, description, discount, expiryDate } = req.body;
        // const discountValue = parseInt(discount);

        
        // const products = await Product.find({ categoryName: categoryId });

        
        // const updatePromises = products.map(product => {
        //     if (product.offer <= discountValue) {
        //         product.offer = discountValue ;  
        //         product.finalPrice = product.price * ( discountValue / 100);
        //         return product.save();
        //     }
        //     return Promise.resolve();  
        // });

        
        // await Promise.all(updatePromises);
        
        const result = new CategoryOffer({
            categoryId,
            description,
            discount,
            expiryDate,
            is_activated: true
        });
        await result.save();

        res.redirect('/admin/CategoryOfferList');
    } catch (error) {
        console.error(error.message, 'adding category offers');
        res.status(400).send(error.message);
    }
};

const productOfferStatus = async (req,res)=>{
    try {
        const offerId = req.query.offerId
        const productOffer = await ProductOffers.findOne({_id: offerId})
        // console.log(offerId,'offerId')
        if(productOffer.is_activated==true){
            await ProductOffers.findOneAndUpdate({_id: offerId},{$set: {is_activated: false}})
            res.json({is_activated: true})
        }else{
            await ProductOffers.findOneAndUpdate({_id: offerId},{$set: {is_activated: true}})
            res.json({is_activated: false})
        }
    } catch (error) {
        console.log(error,'from changing the offer of product');
        
    }
}


const deleteProductOffer = async (req,res)=>{
    try {
        const offerId = req.query.offerId
        const deletion = await ProductOffers.findOneAndDelete({_id: offerId})
        if(deletion){
            return res.redirect('/admin/ProductOfferList')
        }else{
            req.flash('newOfferMsg','There is a problem in the deletion...!!!')
            return res.redirect('/admin/ProductOfferList')
        }
    } catch (error) {
        console.log(error,'from deleting the product offer');
        req.flash('newOfferMsg','There is a problem in the deletion...!!!')
        return res.redirect('/admin/ProductOfferList')
    }
}


module.exports = {
    loadProductOffers,
    addOffer,
    loadCategoryOffers,
    addCategoryOffer,
    productOfferStatus,
    deleteProductOffer
}