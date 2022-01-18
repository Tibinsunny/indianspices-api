const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
try{

    mongoose.connect(process.env.MONGO_URL,{ useNewUrlParser: true, useUnifiedTopology: true },() => {
        console.log("Connected to DB")
    });
}
catch(error)
{
    console.log("error in connectiong to database");
}

let db = mongoose.connection;

module.exports = db;

