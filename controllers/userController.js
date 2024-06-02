const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Otp = require('../models/otp');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Cart = require('../models/cartModel');
const Address = require('../models/addresses')

const securePassword = async(password) => {
    try{
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error){
        console.log(error.messgae);
    }
}

const home = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        if(userData){
            const cart = await Cart.findOne({ userId: userId }).populate('products.productId').exec();
            if(cart){
                res.render('home',{products: cart.products,name: userData.name,picture: userData.picture })
            }else{
                res.render('home',{products: [],name: userData.name,picture: userData.picture })
            }
        }else{
            res.render('home',{products: [],name: '',picture: '' })
        }
    } catch (error) {
        console.log(error.message)
    }
}
const shop = async(req,res)=>{
    try {
        // console.log(typeof(req.query.type));
        if(req.query.type){
            const productData = await Product.find({is_listed: true}).sort({price:parseInt(req.query.type)})
            res.render('shop',{products: productData})
        }else{
            const productData = await Product.find({is_listed: true})
            res.render('shop',{products: productData})
        }
    } catch (error) {
        console.log(error.message);
    }
}
const category = async(req,res)=>{
    try {
        const data = await Category.findOne({is_listed:true})
        res.render('category',{data: data})
    } catch (error) {
        console.log(error.message);
    }
}

const about = async(req,res)=>{
    try {
        res.render('about')
    } catch (error) {
        console.log(error.message);
    }
}
const contact = async(req,res)=>{
    try {
        res.render('contact')
    } catch (error) {
        console.log(error.message);
    }
}
const blog = async(req,res)=>{
    try {
        res.render('blog')
    } catch (error) {
        console.log(error.message);
    }
}
const wishlist = async(req,res)=>{
    try {
        res.render('wishlist')
    } catch (error) {
        console.log(error.message);
    }
}


const sign_in = async(req,res)=>{
    try {
        const forgot=req.flash('errmsg')
        res.render('signIn',{forgot})
    } catch (error) {
        console.log(error.message);
    }
}
const register = async(req,res)=>{
    try {
        res.render('register')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req, res) => {
    try{
        const email = req.body.signIn_email;
        const password = req.body.signIn_password;
        const userData = await User.findOne({email: email});
        
        if(userData){
            const passwordMatch = await bcrypt.compare(password, userData.password);
            
            if(passwordMatch){
                if(userData.is_blocked == false){
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                }
                else{
                    console.log('blocked');
                    res.render('signIn',{message:"Blocked"});
                }
            }
            else {
                res.render('signIn',{message:"Email and Password is incorrect...!!!"});
            }
        }
        else{
            res.render('signIn',{message:"User not existing..!!"});
        }

    } catch (error) {
        console.log(error.message);
    }
}


// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: process.env.user,
      pass: process.env.pass
    }
  });
  
  // Generate OTP
  function generateOTP() {
    const otp = Math.floor(1000 + Math.random() * 9000);
    return otp.toString();
  }


const insertUser = async (req, res) => {

    try{
        const { name, phone_number, password } = req.body
        const email = req.body.email.toLowerCase()

        const exist = await User.findOne({email: email})
        if(exist){
            res.render('register', {message: "User alredy existing...!!!"});
        }
        else{
                const spassword = await securePassword(password);

                const user = User({
                    name: name,
                    email: email,
                    phone_number: phone_number,
                    password: spassword,
                    is_blocked:false,
                    is_verified:false
                });

                const userData = await user.save();

                if(userData){
                    // console.log('date is saved');
                    // const data = await User.findOne({email: email})
                    
                    // console.log(req.body.register_email);

                    const otp = generateOTP();
                    console.log(email,otp);
                    const mailOptions = {
                        from: process.env.user, // my email address
                        to: email,
                        subject: 'OTP for Email Verification',
                        text: `Your OTP (One-Time Password) for email verification is: ${otp}`
                    };

                    await transporter.sendMail(mailOptions);
                    const confirmation = Otp({
                        email: email,
                        otp: otp
                    });
                    confirmation.save()//save data into data base

                    res.redirect(`/loadOtp?email=${email}`)
                    // res.redirect('/home')
                }else{
                    res.render('register', {message: "Your registration has been failed...!!!"});
                }
    
        }
    } catch(error){
        console.log(error.message);
    }
}

const userDashboard = async(req,res)=>{
    try {
        const userData = await User.findById({_id: req.session.user_id})
        const addresses = await Address.findOne({userId: req.session.user_id})
        if(req.query.re){
            req.flash('addressmsg', "Please add Address...!!!");
            return res.redirect('/userDashboard')
        }
        const addressmsg = req.flash('addressmsg')
        // console.log(addresses.addresses);
        if(addresses){
            res.render('userDashboard',{user: userData,addresses: addresses.addresses,addressmsg})
        }else{
            res.render('userDashboard',{user: userData,addresses: [],addressmsg})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}



const verifyOTP = async (req, res) => {
    const email = req.body.email;
    const receivedOTP = req.body.otp;
    const forgot = req.body.forgot
    try {
        const generatedOTP = await Otp.findOne({ email: email});
        
        if (!generatedOTP) {
            // No OTP found for the email
            return res.status(400).send('No OTP found for the email');
        }
        
        console.log(generatedOTP.otp);
        
        if (receivedOTP == generatedOTP.otp) {
            const data = await User.findOne({email: email})
            req.session.user_id = data._id
            // res.status(200).send('OTP verification successful');
            if(req.body.forgot){
                res.redirect('/forgotPassword')
            }else{
                res.redirect('/home')
            }
        } else {
            // res.status(400).send('Invalid OTP');
            res.render('otp',{message: 'Invalid otp',email: email})
        }
    } catch (error) {
        console.error('Error while verifying OTP:', error);
        res.status(500).send('Internal Server Error');
    }
}

const loadOtp = async(req,res)=>{
    try {
        const email = req.query.email;
        const forgot = req.query.forgot;
        res.render('otp',{message: '',email,forgot})
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditUser = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        const userData = await User.findOne({_id: userId })
        res.render('editProfile',{userData})
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

const editProfile = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        const { name,phone_number } = req.body;
        const userData = await User.findOneAndUpdate({_id: userId },{$set:{name: name,phone_number: phone_number}})
        if(userData){
            res.redirect('/userDashboard')
        }else{
            res.redirect('/signIn')
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}


const loadChangePassword = async (req,res)=>{
    try {
        const msg = req.flash('errmsg')
        res.render('changePassword',{msg})
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

const changePassword = async (req,res)=>{
    try {
        const userId = req.session.user_id
        const { password,new_password } = req.body
        const userData = await User.findOne({_id: userId})

        const passwordMatch = await bcrypt.compare(password,userData.password)

        if(passwordMatch){
            const spassword = await securePassword(new_password)
            const change = await User.findOneAndUpdate({_id: userId},{$set:{password: spassword}})
            if(change){
                res.redirect('/userDashboard')
            }else{
                req.flash('errmsg', 'Unabel to change password...!!!');
                return res.redirect('/changePassword')
            }
        }else{
            req.flash('errmsg', 'Password is incorrect...!!!');
            return res.redirect('/changePassword')
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}


const loadForgotPassword = async (req,res)=>{
    try {
        res.render('forgotPassword')
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

const forgotPassword = async (req,res)=>{
    try {
        const email = req.body.email;
        const userData = await User.findOne({email: email})
        if(userData){
            const otp = generateOTP();
                    console.log(email,otp);
                    const mailOptions = {
                        from: 'tungsten.industries007@gmail.com', // my email address
                        to: email,
                        subject: 'OTP for Email Verification',
                        text: `Your OTP (One-Time Password) for email verification is: ${otp}`
                    };

                    await transporter.sendMail(mailOptions);
                    const confirmation = Otp({
                        email: email,
                        otp: otp
                    });
                    confirmation.save()//save data into data base

                    res.redirect(`/loadOtp?email=${email}&forgot=${true}`)
        }else{
            req.flash('errmsg', 'Email is not existing...!!!');
            return res.redirect('/signIn')
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

const savePassword = async (req,res)=>{
    try {
        const { password } = req.body
        const userId = req.session.user_id;
        if(userId){
            const spassword = await securePassword(password)
            const user = await User.findOneAndUpdate({_id:userId},{$set:{password:spassword}})
            if(user){
                res.redirect('/home')
            }
        }else{
            res.status(400).send(error.message) 
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

const googleLoginSuccess = async (req,res)=>{
    try {
        if(!req.user){
            res.redirect('/failure')
        }
        console.log(req.user);
        const userData = await User.findOne({email: req.user.email})
        if(!userData){
            const result = User({
                name: req.user.given_name,
                email: req.user.email,
                picture: req.user.photos[0].value,
                is_blocked: false,
                is_verified: true
            })
            const status = result.save()
            if(status){
                req.session.user_id=result._id
                res.redirect('/home')
            }else{
                res.status(400).send(error.message)
            }
        }else{
            req.session.user_id = userData._id;
            res.redirect('/home')
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

const googleLoginFailure = async(req,res)=>{
    try {
        res.send('Error')
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

module.exports = {
    home,
    shop,
    category,
    about,
    contact,
    blog,
    wishlist,
    sign_in,
    register,
    insertUser,
    verifyLogin,
    userDashboard,
    logout,
    loadOtp,
    verifyOTP,
    loadEditUser,
    editProfile,
    loadChangePassword,
    changePassword,
    loadForgotPassword,
    forgotPassword,
    googleLoginSuccess,
    googleLoginFailure,
    savePassword
}