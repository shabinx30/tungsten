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


        let currentDate = new Date();
let startOfWeek = new Date(currentDate);
startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the week (Sunday)
startOfWeek.setHours(0, 0, 0, 0); // Set time to start of the day

let endOfWeek = new Date(startOfWeek);
endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
endOfWeek.setHours(23, 59, 59, 999); // Set time to end of the day

// Debug: Print the start and end of the week
console.log('Start of Week:', startOfWeek);
console.log('End of Week:', endOfWeek);

let orderWeek = await Order.aggregate([
    {
        $match: {
            orderTime: {
                $gte: startOfWeek, // Start of the week (Sunday)
                $lt: endOfWeek     // End of the week (Saturday)
            }
        }
    },
    {
        $group: {
            _id: {
                dayOfWeek: { $dayOfWeek: '$orderTime' },  // Day of the week (1 for Sunday, 7 for Saturday)
                week: { $isoWeek: '$orderTime' },         // ISO week number
                year: { $isoWeekYear: '$orderTime' }      // ISO week year
            },
            totalIncome: { $sum: '$subTotal' }
        }
    },
    {
        $project: {
            _id: 0,
            week: '$_id.week',
            year: '$_id.year',
            totalIncome: 1,
            weekDayName: {
                $switch: {
                    branches: [
                        { case: { $eq: ["$_id.dayOfWeek", 1] }, then: "Sunday" },
                        { case: { $eq: ["$_id.dayOfWeek", 2] }, then: "Monday" },
                        { case: { $eq: ["$_id.dayOfWeek", 3] }, then: "Tuesday" },
                        { case: { $eq: ["$_id.dayOfWeek", 4] }, then: "Wednesday" },
                        { case: { $eq: ["$_id.dayOfWeek", 5] }, then: "Thursday" },
                        { case: { $eq: ["$_id.dayOfWeek", 6] }, then: "Friday" },
                        { case: { $eq: ["$_id.dayOfWeek", 7] }, then: "Saturday" }
                    ],
                    default: "Unknown"
                }
            }
        }
    },
    {
        $sort: { "_id.dayOfWeek": 1 } // Sort by day of the week
    }
]);

console.log(orderWeek);
    
        

        console.log(orderMonth)
        // console.log(JSON.stringify(orderWeek, null, 2));

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

        // console.log(orderYear);
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

