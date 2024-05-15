const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/e-commerce_management_system");
const express = require('express')
const app = express()
const nocache = require('nocache');
const path = require('path')
require('dotenv').config();
app.use(nocache())

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

const userRoute = require('../TUNGSTEN/routes/userRoute');
app.use('/',userRoute)

const adminRoute = require('../TUNGSTEN/routes/adminRoute')
app.use('/admin',adminRoute)

let PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Server is running on http://localhost:${PORT}/admin`);
})