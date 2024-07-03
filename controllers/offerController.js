const Offers = require('../models/offers')


const loadOffers = async (req,res)=>{
    try {
        const offers = await Offers.find({})
        if(offers){
            res.render('offerList',{offers})
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

module.exports = {
    loadOffers
}