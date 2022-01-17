const express = require("express");
const cardamomRoute =express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        limiter: true,
        type: "error",
        message: 'You can only send 10 request in 15 minutes for security reasons'
      }
})
// Apply the rate limiting middleware to all requests
cardamomRoute.use(limiter)
cardamomRoute.use(express.json())
let url;
//const url = `http://localhost:3001/test.html`
async function getData(options){
    if(options ==="large")
    {
         url = "http://www.indianspices.com/marketing/price/domestic/daily-price-large.html";
    }
    else
    {
         url = "http://www.indianspices.com/marketing/price/domestic/daily-price-small.html";
    }
    let allData = [];
  const { data } = await axios.get(url);
    const $ = cheerio.load(data);
   if(options=="archieve")
   {
    for (let index = 1; index <= 10; index++) {
        let tableRow = $(`div.tabstable:nth-child(7) > table:nth-child(1) > tbody:nth-child(1)> tr:nth-child(${index+1})`); // > tr:nth-child(1)
     // allData.push(tableRow.text().replace(/  /g,'').replace(/\n/g, ",").replace(/\t/g,"").split)
     let parser = (tableRow.text().replace(/  /g,'').replace(/\n/g, "_").replace(/\t/g,"").split("_"));
     allData.push({
          sl:parser[1],
          date:parser[2],
          Auctioneer:parser[3],
          Lots:parser[4],
          Total_Arrived:parser[5],
          Qty_Sold:parser[6],
          MaxPrice:parser[7],
          Avg_Price:parser[8],
          type:"small"
      });
        
    }
   }
   if(options=="today")
   {
    let temp=true;
    for (let index = 1; index < 4; index++) {
        let tableRow = $(`div.tabstable:nth-child(7) > table:nth-child(1) > tbody:nth-child(1)> tr:nth-child(${index+1})`) ;
        let parser = (tableRow.text().replace(/  /g,'').replace(/\n/g, "_").replace(/\t/g,"").split("_"));
        if(temp === parser[2] || temp===true)
        {
            allData.push({
                sl:parser[1],
                date:parser[2],
                Auctioneer:parser[3],
                Lots:parser[4],
                Total_Arrived:parser[5],
                Qty_Sold:parser[6],
                MaxPrice:parser[7],
                Avg_Price:parser[8], 
                type:"small"
            });
            temp = parser[2];
        }

    }
 
   }
   if(options=="large")
   {
      
       for (let index = 0; index <= 10; index++) {
           let ruler=3;
           let tableRow = $(`div.tabstable:nth-child(5) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(3)`);
           let parser = (tableRow.text().replace(/  /g,'').replace(/\n/g, "_").replace(/\t/g,"").split("_"));
           allData.push({
            Sno:parser[1],
            date:parser[2],
            market:parser[3],
            type:parser[4],
            price:parser[5]  
        })
        ruler++;
           
       }
   }
    return allData;
}
cardamomRoute.get("/",(req,res) => {
    return res.json({
        welcome:"Welcome to the API /_-_(- -)_-_/"
    });
})
cardamomRoute.get("/archieve",async (req,res) => {
let getDetails = await getData("archieve");
return res.json(getDetails);
})
cardamomRoute.get("/latest",async (req,res) => {
    let getDetails = await getData("today");
    return res.json(getDetails);
    })
cardamomRoute.get("/large",async(req,res) =>{
let getDetails = await getData("large");
return res.json(getDetails)

})
module.exports = cardamomRoute;