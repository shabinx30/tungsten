const express = require('express')
const user_route = express()

const session = require('express-session')
const userAuth = require('../middleware/userAuth')
const config = require('../config/config')
user_route.use(session({
    secret:config.sessionSecret,
    resave: false,
    saveUninitialized: true,
}))
const userController = require('../controllers/userController')
const productController = require('../controllers/product')

user_route.set('view engine','ejs')
user_route.set('views','./views/users')

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

user_route.get('/',userController.home)
user_route.get('/home',userController.home)
user_route.get('/userDashboard',userAuth.isLogin,userController.userDashboard)
user_route.get('/shop',userAuth.isLogin,userController.shop)
user_route.get('/product',userAuth.isLogin,productController.loadProductDetails)
user_route.get('/category',userController.category)
user_route.get('/about',userController.about)
user_route.get('/contact',userController.contact)
user_route.get('/blog',userController.blog)
user_route.get('/wishlist',userAuth.isLogin,userController.wishlist)
user_route.get('/signIn',userController.sign_in)
user_route.post('/signIn',userController.verifyLogin)
user_route.get('/register',userController.register)
user_route.get('/cart',userAuth.isLogin,userController.cart)
user_route.post('/register',userController.insertUser)
user_route.get('/logout',userController.logout)

user_route.get('/loadOtp',userController.loadOtp)
user_route.post('/verifyotp', userController.verifyOTP);


// user_route.get('*',(req,res)=>{
//     res.send('<style>body{background: black;}</style><h1 style="color: white; font-family: Courier, monospace; text-align: center; margin-top: 20%;">Page not found<span style="color: red";> !!!</span></h1>')
// })

module.exports = user_route