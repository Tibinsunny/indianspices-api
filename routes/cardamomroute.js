const express = require("express");
const cardamomRoute =express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const rateLimit = require('express-rate-limit');
const dataModel = require("../model/alldata")
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
async function getData(options,pageData){
    if(options ==="large")
    {
         url = "http://www.indianspices.com/marketing/price/domestic/daily-price-large.html";
    }
    if(options === "page")
    {
        url = `http://www.indianspices.com/marketing/price/domestic/daily-price-small.html?page=${pageData}`;
        options = "archieve";
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
          sl:Number(parser[1]),
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
       console.log(url)
    let temp=true;
    for (let index = 1; index < 4; index++) {
        let tableRow = $(`div.tabstable:nth-child(7) > table:nth-child(1) > tbody:nth-child(1)> tr:nth-child(${index+1})`) ;
        let parser = (tableRow.text().replace(/  /g,'').replace(/\n/g, "_").replace(/\t/g,"").split("_"));
        if(temp === parser[2] || temp===true)
        {
            allData.push({
                sl:Number(parser[1]),
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

      let ruler=3;
       for (let index = 0; index <= 10; index++) {
           let tableRow = $(`div.tabstable:nth-child(5) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(${ruler})`);
           let parser = (tableRow.text().replace(/  /g,'').replace(/\n/g, "_").replace(/\t/g,"").split("_"));
           allData.push({
            Sno:Number(parser[1]),
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
cardamomRoute.get("/archieve/all",async(req,res) => {
    let allData = await dataModel.find({},{_id:0,__v:0}).sort({sl:1});
    return res.json(allData)
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
cardamomRoute.get("/archieve/:pageNo",async(req,res) => {
let pageNo = req.params.pageNo;
let getDetails = await getData("page",pageNo);
return res.json(getDetails)
})

cardamomRoute.get("/update",async(req,res) => {
    let temp;
    let getDetails = await getData("today");
    let date = getDetails[0].date;
    let oldValue = await dataModel.find({date:date})
    console.log(getDetails)
    if(oldValue.length > 0)
    {
        return res.json({
            error:"Everything is uptodate"
        })
    }
    else
    {
        let length = getDetails.length;
        let updateInc = await dataModel.updateMany({},{$inc:{sl:length}})
        for (let index = 0; index < getDetails.length; index++) {
            let element = getDetails[index];
           let updateData = await dataModel(element);
           let saveData = await updateData.save()
           temp=index;
            
        }
        return res.json({
            success:"Updated",
            updated:`${temp+1} datas`
        })
    }
})
module.exports = cardamomRoute;