const Order = require('../models/orders')

const monthlySales = async (req,res)=>{
    try {
        let orderMonth = await Order.aggregate([
            {
                $group: {
                    _id: { $month: '$orderTime' },
                    totalIncome: { $sum: '$subTotal' }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id',
                    totalIncome: 1,
                    monthName: {
                        $arrayElemAt: [
                            ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                            { $subtract: ["$_id", 1] }
                        ]
                    }
                }
            }
        ]);        

        console.log(orderMonth)

        return res.json({orderMonth})
    } catch (error) {
        console.log(error,'from report in admin side');
    }
}

const yearlySales = async (req,res)=>{
    try {
        let orderYear = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$orderTime' },
                    }, totalIncome: { $sum: '$subTotal' }
                }
            }

        ])

        console.log(orderYear);
        return res.json({orderYear})
        
    } catch (error) {
        console.log(error);
        
    }
}


// load sales report page
const loadSales = async (req,res)=>{
    try {
        const Sales = await Order.find({}).sort({purchasedDate: -1})

        res.render('salesReport',{Sales})
    } catch (error) {
        console.log(error);
    }
}

const sortSalesReport = async (req,res)=>{
    try {
        const {sort} = req.query

        if(sort == 'day'){
            let today = new Date().toDateString()

            let report = await Order.find({ purchasedDate: { $eq: today } })

            res.render('salesReport', { Sales: report })
        }else if(sort == 'month'){
            let today = new Date();
            let startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            let report = await Order.find({ orderTime: { $gte: startOfMonth } }).sort({ orderTime: -1 })
            res.render('salesReport', { Sales: report })
        }else if(sort == 'year'){
            let today = new Date();
            let startOfYear = new Date(today.getFullYear(), 0, 1);

            let report = await Order.find({ orderTime: { $gt: startOfYear } }).sort({ orderTime: -1 })
            res.render('salesReport', { Sales: report })
        }
    } catch (error) {
        console.log(error,'sort the sales.');
        
    }
}


const searchWithDate = async (req,res)=>{
    try {
        const { searcheDate } = req.body

        let searchedDate = new Date(searcheDate)

        let report = await Order.find({ orderTime: { $gt: searchedDate } }).sort({ orderTime: -1 })


        res.render('salesReport', { Sales: report })
    } catch (error) {
        console.log(error,'searching with the date in sales.');
        
    }
}

//Invoice
const loadInvoice = async (req,res)=>{
    try {
        const _id = req.query.Id;
        const order = await Order.findOne({_id}).populate('orderedProducts.productId')
        if(!order){
            return res.send('Cannot find the order.')
        }
        console.log(order);
        

        return res.render('Invoice',{order})
        
    } catch (error) {
        console.log(error);
        
    }
}


module.exports = {
    monthlySales,
    yearlySales,
    loadSales,
    sortSalesReport,
    searchWithDate,
    loadInvoice
}

