const userModel=require('../models/userModel')

const isLogin = async (req,res,next)=>{
    const a=await userModel.findOne({_id:req.session.user_id})
    try {
        if(req.session.user_id&&a.is_blocked===false){
            // console.log(req.session.user_id,'its in auth');
            next()
        }else{
            res.redirect('/signIn')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(!req.session.user_id){
            res.redirect('/signIn')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    isLogin,
    isLogout
}