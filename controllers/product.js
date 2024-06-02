const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const multer = require('multer')
const path = require('path')

const loadProductDetails = async (req,res)=>{
    try {
        const productDetails = req.query.productDetails
        const product = await Product.findById({_id: productDetails})
        res.render('product',{product: product})
    } catch (error) {
        console.log(error.message);
    }
}

const loadProductList = async (req,res)=>{
    try {
        const productsData = await Product.find({})
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
        const productDetails = await Product.findById({_id: productId})
        const categories = await Category.find({is_listed: true})
        const errmsg=req.flash('errmsg')
        res.render('editProduct',{productDetails,errmsg,categories})
    } catch (error) {
        console.log(error.message);
    }
}

const storage = multer.diskStorage({
    destination: function(req,file,callback){
        callback(null,path.join(__dirname,'../public/productImages'));
    },
    filename: function(req,file,callback){
        callback(null, Date.now()+'-'+file.originalname)
    }
})

const upload = multer({storage: storage }).fields([
    { name: "images",maxCount: 4},
]);

const editProduct = async (req,res)=>{
    try {
        const productId = req.body.productId;
        const productName = req.body.productName;

        const exist = await Product.findOne({name: productName})
        if(exist){
            req.flash('errmsg','Sorry this product is already existing...!!!')
            return res.redirect('/admin/editProduct')
        }else{

            const images = req.files['images'].map(e=>e.filename);
            console.log(images);

            const confirmation = await Product.findOneAndUpdate({_id: productId},{
                $set:{
                    name: req.body.name,
                    price: req.body.price,
                    quantity: req.body.quantity,
                    description: req.body.description,
                    images,
                    categoryName: req.body.category,
                    is_listed: true
                }
            });
            if(confirmation){
                const products = await Product.find({});
                res.render('productList',{products,success: ''});
            }else{
                res.status(500).json({ error: 'Internal server error', message: error.message });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadProductDetails,
    loadProductList,
    listProduct,
    loadEditProduct,
    editProduct,
    upload
}