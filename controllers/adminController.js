const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const path = require('path')
const multer = require('multer');



const verifyLogin = async (req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email: email})
        if(userData){

            const MatchPassword = await bcrypt.compare(password,userData.password)
            if(MatchPassword){
                if(userData.is_admin === false){
                    res.render('adminLogin',{message:"Your not an admin...!!!"})
                }else{
                    
                    req.session.admin = userData._id;
                    res.redirect('/admin/dashboard');
                }
            }else{
                res.render('adminLogin',{message:"Email or Password is incorrect...!!!"})
            }
        }else{
            res.render('adminLogin',{message:"Email or Password is incorrect...!!!"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async(req,res) => {
    try {
        res.render('adminLogin');

    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async(req, res) => {
    try {
        // console.log('dashboard')
        res.render('adminDashboard');

    } catch (error) {
        console.log(error.message);
    }
}

const logout = async(req,res)=>{
    try {

        req.session.destroy()

        return res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}

const userList = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.admin});
        const userData1 = await User.find({is_admin:0})
        res.render('userList',{admin:userData,users:userData1})
    } catch (error) {
        console.log(error.message);
    }
}

const loadcategoryList = async (req,res)=>{
    try {
        const categoriesData = await Category.find({})
        if(categoriesData){
            res.render('categoryList',{success:"ok",categories:categoriesData})
        }else{
            res.render('categoryList',{errmsg:"error"})
        }
    } catch (error) {
        console.log(error.message);
    }
}


const loadaddCategory = async (req,res)=>{
    try {
        res.render('addCategory',{success:"ok"})
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async (req,res)=>{
    try {
        // const name = req.body.name.trim().toUpperCase();
        const category = req.body.category;
        let changes = true
        console.log(req.body.changes);
        const exist = await Category.findOne({name: category})
        if(exist){
            res.render('addCategory',{errmsg:"Category is already existing"});
        }else{
            if(req.body.changes=="unlisted"){
                let changes = false
            }
            const data = Category({
                name:category,
                is_listed:changes
            });

            const categoryData = await data.save()

            if(categoryData){
                const categoriesData = await Category.find({})
                if(categoriesData){
                    res.render('categoryList',{success:"ok",categories:categoriesData})
                }else{
                    res.render('categoryList',{errmsg:"error"})
                }
            }else{
                const categoriesData = await Category.find({})
                if(categoriesData){
                    res.render('categoryList',{success:"ok",categories:categoriesData})
                }else{
                    res.render('categoryList',{errmsg:"error"})
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const blockUser = async(req,res)=>{
    try {
        const userId = req.query.userId;
        const checking = await User.findOne({ _id: userId});

        if (checking.is_blocked == false) {
            const confirmation = await User.findOneAndUpdate({ _id: userId }, { $set: { is_blocked: true } });
            // req.session.user_id=null
            res.json(confirmation)
        } else {
            const confirmation = await User.findOneAndUpdate({ _id: checking._id }, { $set: { is_blocked: false } });
            res.json(confirmation)
        }
    } catch (error) {
        console.log(error.message);
    }
}

const listCategory = async(req,res)=>{
    try {
        const categoryId = req.query.categoryId
       

        const checking = await Category.findById({ _id: categoryId});

        if (checking.is_listed == false) {
            const confirmation = await Category.findOneAndUpdate({ _id: checking._id }, { $set: { is_listed: true } });
            res.json(confirmation)
        } else {

            const confirmation = await Category.findOneAndUpdate({ _id: checking._id }, { $set: { is_listed: false } });
            res.json(confirmation)
        }
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCategory = async (req,res)=>{
    try {
        const categoryId = req.query.categoryId;

        const checking = await Category.findById({_id: categoryId})
        if(checking){
            const confirmation = await Category.deleteOne({_id: categoryId})
            if(confirmation){
                if(req.session.admin){
                    const data = await Category.find({})
                    res.render('categoryList',{categories: data})
                }else{
                    res.status(500).json({ error: 'Internal server error', message: error.message });
                }
            }else{
                res.status(500).json({ error: 'Internal server error', message: error.message });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditCategory = async (req,res)=>{
    try {
        const categoryId = req.query.categoryId
        const categoryName = req.query.categoryName
        res.render('editCategory',{categoryId: categoryId,categoryOldName: categoryName,errmsg:'ok'})
    } catch (error) {
        console.log(error.message);
    }
}

const editCategory = async (req,res)=>{
    try {
        const categoryId = req.body.categoryId;
        // const categoryOldName = req.body.categoryOldName
        const categoryName = req.body.categoryName;
        let changes = true;

        if(req.body.changes=='unlisted'){
            changes = false
        }
        // console.log(req.body.categoryOldName);
        const exist = await Category.findOne({name: categoryName})

        //checking the category name is existing or not
        if(exist){
            res.render('editCategory',{errmsg: 'This category is already existing...!!!',categoryId: categoryId})
        }else{
            const confirmation = await Category.findOneAndUpdate({_id: categoryId},{$set:{name: categoryName, is_listed: changes}})
            if(confirmation){
                const data = await Category.find({})
                res.render('categoryList',{categories: data})
            }else{
                res.status(500).json({ error: 'Internal server error', message: error.message });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddProduct = async (req,res)=>{
    try {
        const categoryData = await Category.find({is_listed: true})
        const msg=req.flash('errmsg')
        res.render('addProduct',{categories: categoryData,msg})
    } catch (error) {
        console.log(error.message);
    }
}



//multer
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
])



//add product
const addProduct = async (req, res) => {
    try {
        // console.log('req.body', req.body);
        // const categoriesData = await Category.find({});

        if (req.body.name.trim().toUpperCase() === '') {
            // res.render('addProduct', { errmsg: 'Name is required', categories: categoriesData });
            req.flash('errmsg', 'Name is required');
            return res.redirect('/admin/addProducts')
        }


                const name = req.body.name.trim().toUpperCase();
                const exist = await Product.findOne({ name: name });
                if (exist) {
                    // res.render('addProduct', { errmsg: 'This Product is already exist...!!!', categories: categoriesData });
                    req.flash('errmsg', 'This Product is already exist...!!!');
                    return res.redirect('/admin/addProducts')
                } else {
                    const images = req.files['images'].map(e=>e.filename);
                    console.log(images)
                // if(req.file.size > 4){
                //     req.flash('errmsg', 'You need to insert 4 images');
                //     return res.redirect('/admin/addProducts')
                // }
             
        
  
                const product = Product({
                    name: name,
                    price: req.body.price,
                    quantity: req.body.quantity,
                    categoryName: req.body.category,
                    description: req.body.description,
                    images,
                    is_listed:true
                })

                const data = await product.save();
                if(data){
                    const productsData = await Product.find({})
                    res.render('productList',{products: productsData,success: 'New Product added'})
                }else{
                    res.render('productList',{products: productsData,success: 'Cannot add new Product'})
                }
              
                
            }
        
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    verifyLogin,
    loadLogin,
    loadDashboard,
    logout,
    userList,
    loadcategoryList,
    loadaddCategory,
    addCategory,
    blockUser,
    listCategory,
    deleteCategory,
    loadEditCategory,
    editCategory,
    loadAddProduct,
    addProduct,
    upload
}