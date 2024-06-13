const express = require('express')
const admin_route = express();
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('express-flash')

admin_route.use(session({
    secret:process.env.sessionSecret,
    resave: false,
    saveUninitialized: true,
}));


admin_route.use(flash())
admin_route.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            req.flash('error', 'File size exceeds the limit');
            return res.redirect('/admin/addProducts'); 
        }
    }
    next(err);
});

const adminAuth = require('../middleware/adminAuth')
// const userAuth = require('../middleware/userAuth')
const adminController = require('../controllers/adminController');
const productController = require('../controllers/product')
const orderController = require('../controllers/order')

admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended: true}))

admin_route.set('views','./views/admin')
admin_route.set('view engine','ejs')



admin_route.get('/',adminAuth.isLogout,adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);

admin_route.get('/dashboard',adminAuth.isLogin,adminController.loadDashboard);

//user list
admin_route.get('/userList',adminAuth.isLogin,adminController.userList);
admin_route.get('/blockUser',adminAuth.isLogin,adminController.blockUser)
admin_route.get('/logout',adminAuth.isLogin,adminController.logout);

//products
admin_route.get('/productsList',adminAuth.isLogin,productController.loadProductList)
admin_route.get('/addProducts',adminAuth.isLogin,adminController.loadAddProduct)
// admin_route.post('/addProducts',upload.array('screenshotImages',2),adminController.addProduct)
admin_route.post('/addProducts',adminAuth.isLogin,adminController.upload,adminController.addProduct);
admin_route.get('/productStatus',adminAuth.isLogin,productController.listProduct)
admin_route.get('/editProduct',adminAuth.isLogin,productController.loadEditProduct)
admin_route.post('/editProduct',adminAuth.isLogin,adminController.upload,productController.editProduct)

//category
admin_route.get('/categoryList',adminAuth.isLogin,adminController.loadcategoryList)
admin_route.get('/addCategory',adminAuth.isLogin,adminController.loadaddCategory)
admin_route.post('/addNewCategory',adminAuth.isLogin,adminController.addCategory)
admin_route.get('/categoryStatus',adminAuth.isLogin,adminController.listCategory)
admin_route.get('/deleteCategory',adminAuth.isLogin,adminController.deleteCategory)
admin_route.get('/editCategory',adminAuth.isLogin,adminController.loadEditCategory)
admin_route.post('/editCategory',adminAuth.isLogin,adminController.editCategory)


//order
admin_route.get('/orderHistory',adminAuth.isLogin,orderController.orderlist)
admin_route.post('/productStatus',adminAuth.isLogin,orderController.changeStatus)


module.exports = admin_route