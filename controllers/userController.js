const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Otp = require('../models/otp');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')

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
        res.render('home')
    } catch (error) {
        console.log(error.message)
    }
}
const shop = async(req,res)=>{
    try {
        const productData = await Product.find({is_listed: true})
        res.render('shop',{products: productData})
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

const cart = async(req,res)=>{
    try {
        res.render('cart')
    } catch (error) {
        console.log(error.message);
    }
}

const sign_in = async(req,res)=>{
    try {
        res.render('signIn')
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
            res.render('signIn',{message:"Email and Password is incorrect...!!!"});
        }

    } catch (error) {
        console.log(error.message);
    }
}


// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: 'tungsten.industries007@gmail.com', 
      pass: 'dcqc jbtw wibi lvtz'
    }
  });
  
  // Generate OTP
  function generateOTP() {
    const otp = Math.floor(1000 + Math.random() * 9000);
    return otp.toString();
  }


const insertUser = async (req, res) => {

    try{
        // console.log('insert is working');
        const { name, email, phone_number, password } = req.body

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
                    const data = await User.findOne({email: email})
                    if(data){
                        req.session.user_id = data._id
                    }
                    // console.log(req.body.register_email);

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
        res.render('userDashboard',{user: userData})
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
    
    try {
        const generatedOTP = await Otp.findOne({ email: email});
        
        if (!generatedOTP) {
            // No OTP found for the email
            return res.status(400).send('No OTP found for the email');
        }
        
        console.log(generatedOTP.otp);
        
        if (receivedOTP == generatedOTP.otp) {
            // res.status(200).send('OTP verification successful');
            res.redirect('/home')
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

        res.render('otp',{message: '',email})
    } catch (error) {
        console.log(error.message);
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
    cart,
    userDashboard,
    logout,
    loadOtp,
    verifyOTP
}