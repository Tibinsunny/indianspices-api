const express = require("express");
const cardamomRoute = require("./routes/cardamomroute");
const app = express();
app.use("/cardamom",cardamomRoute);

app.get("/",(req,res) => {
    return res.json({
        welcome:"Welcome to the API /_-_(- -)_-_/",
        documentation:"https://random.com"
    })
})

app.listen(3000,(error) => {
    if(error) {
        console.log(error)
    }
    console.log("App is up and running")
})