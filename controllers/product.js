const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const multer = require('multer')
const path = require('path')
const ProductOffer = require('../models/ProductOffers')
const mongoose = require('mongoose');
const CategoryOffer = require('../models/categoryOffer')


//rendering the shop page
const shop = async (req, res) => {
    try {

        let page = parseInt(req.query.page) || 0;
        let type = req.query.type;

        let productData = await Product.find({is_listed: true});
        let productCount;

        for(let product of productData){
            
            let finalPrice = product.price
            let offer = 0;

            const product_offer = await ProductOffer.findOne({productName: product._id,is_activated: true})
            const category_offer = await CategoryOffer.findOne({categoryId: product.categoryName, is_activated: true })
            
            if(product_offer){
                finalPrice = (product.price*product_offer.discount)/100
                offer = product_offer.discount
            }
            if(category_offer&&offer<category_offer.discount){
                finalPrice = (product.price*category_offer.discount)/100
                offer = category_offer.discount
            }
            
            await Product.findOneAndUpdate({_id: product._id},{$set:{finalPrice,offer}})
            
        }

        const limit = 4;
        const skip = (page * limit);


        if (type == 1) {
            productCount = await Product.find({ is_listed: true }).countDocuments();
            productData = await Product.find({ is_listed: true }).sort({ price: 1 }).populate('categoryName').skip(skip).limit(limit);
        } else if (type == -1) {
            productData = await Product.find({ is_listed: true }).sort({ price: -1 }).populate('categoryName').skip(skip).limit(limit);
        } else if (type == 'a') {
            productData = await Product.find({ is_listed: true }).sort({ name: 1 }).populate('categoryName').skip(skip).limit(limit);
        } else if (type == 'z') {
            productData = await Product.find({ is_listed: true }).sort({ name: -1 }).populate('categoryName').skip(skip).limit(limit);
        } else {
            productCount = await Product.find({ is_listed: true }).countDocuments();
            productData = await Product.find({ is_listed: true }).populate('categoryName').skip(skip).limit(limit);
            
            // Filter products where the category is listed
            productData = productData.filter(product => product.categoryName && product.categoryName.is_listed);
        }

        

        // Render the shop view with the fetched product data and product count
        res.render('shop', { products: productData, productCount, page });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

//loading product data in admin
const loadProductDetails = async (req, res) => {
    try {
        const productId = req.query.productDetails;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.redirect('*');
        }

        const product = await Product.findById({ _id: productId }).populate('categoryName').exec();
        if (product) {
            res.render('product', { product });
        } else {
            return res.redirect('*');
        }
    } catch (error) {
        console.error(error.message,'product Details');
        res.status(500).send('Product not found');
    }
};

const loadProductList = async (req,res)=>{
    try {
        const productsData = await Product.find({}).populate('categoryName').exec()
        console.log('darf'+productsData);
        res.render('productList',{products: productsData,success: ''});
    } catch (error) {
        console.log(error.message);
    }
}

const listProduct = async(req,res)=>{
    try {
        const productId = req.query.productId;
       

        const checking = await Product.findById({ _id: productId});

        if (checking.is_listed == false) {
            const confirmation = await Product.findOneAndUpdate({ _id: checking._id }, { $set: { is_listed: true } });
            res.json(confirmation)
        } else {

            const confirmation = await Product.findOneAndUpdate({ _id: checking._id }, { $set: { is_listed: false } });
            res.json(confirmation)
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditProduct = async (req,res)=>{
    try {
        const productId = req.query.productId;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.redirect('*');
        }

        const productDetails = await Product.findById({_id: productId})
        const categories = await Category.find({is_listed: true})
        const errmsg=req.flash('errmsg')
        res.render('editProduct',{productDetails,errmsg,categories})
    } catch (error) {
        console.log(error.message);
    }
}

const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, path.join(__dirname, '../public/productImages'));
    },
    filename: function(req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage }).fields([
    { name: "images", maxCount: 4 },
]);

const editProduct = async (req, res) => {
    try {
        const productId = req.body.productId;
        const productName = req.body.name; // Ensure the form sends the correct field name

        const exist = await Product.findOne({ name: productName });
        if (exist && exist._id.toString() !== productId) { // Ensure the check doesn't fail for the same product
            req.flash('errmsg', 'Sorry this product already exists...!!!');
            return res.redirect(`/admin/editProduct?productId=${productId}`);
        } else {
            const images = req.files['images'] ? req.files['images'].map(e => e.filename) : [];
            console.log(images);

            const confirmation = await Product.findOneAndUpdate({ _id: productId }, {
                $set: {
                    name: req.body.name,
                    price: req.body.price,
                    quantity: req.body.quantity,
                    description: req.body.description,
                    images: images.length ? images : req.body.existingImages, // Handle existing images
                    categoryName: req.body.category,
                    is_listed: true
                }
            }, { new: true });

            if (confirmation) {
                res.redirect('/admin/productsList')
            } else {
                res.status(500).json({ error: 'Internal server error', message: 'Could not update product' });
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};


//************** search product ****************
const searchProducts = async (req,res)=>{
    try {
        let page = 0
        let searchString = req.query.search
        if (!searchString) {
            return res.status(400).json({ error: 'Search string is required' });
        }

        let searchNumber = parseInt(searchString, 10);

        let searchQuery = {
            $or: [
                { name: { $regex: new RegExp(searchString, 'i') } }
            ]
        };

        if (!isNaN(searchNumber)) {
            searchQuery.$or.push({ price: { $lte: searchNumber } });
        }

        let products = await Product.find(searchQuery).sort({ price: -1 })
        res.render('shop', { products, searchString,productCount: products.length,page })
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

module.exports = {
    loadProductDetails,
    loadProductList,
    listProduct,
    loadEditProduct,
    editProduct,
    upload,
    searchProducts,
    shop
}