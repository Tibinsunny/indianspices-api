const mongoose = require("mongoose");


let bulkSchema = new mongoose.Schema({
sl:{
    type:Number
},
date:{
    type:String
},
Auctioneer:{
    type:String
},
Lots:{
    type:String
},
Total_Arrived:{
    type:String
},
Qty_Sold:{
    type:String
},
MaxPrice:{
    type:String
}
,
Avg_Price:{
    type:String
}
,
type:{
    type:String
}



})

let allArchieve = mongoose.model("archieves",bulkSchema);

module.exports = allArchieve;