const express = require("express");
const cardamomRoute = require("./routes/cardamomroute");
const cors = require("cors");
const app = express();
let corsOptions = {
    origin: 'http://localhost:3000',
  }
app.use(cors())
require("./connection/db")

app.use("/cardamom",cardamomRoute);

app.get("/",(req,res) => {
    return res.json({
        welcome:"Welcome to the API /_-_(- -)_-_/",
    })
})

app.listen(process.env.PORT || 3000,(error) => {
    if(error) {
        console.log(error)
    }
    console.log("App is up and running")
})