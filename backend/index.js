require("dotenv").config();
const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const uri = process.env.DB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("gw2-marketeer").collection("market");
  axios.get("https://api.guildwars2.com/v2/items").then(response => {
    const writeOps = [];
    response.data.forEach(id => {
      writeOps.push({ updateOne: {
        "filter" : {"id" : id},
        "update" : {$setOnInsert: {id: id, prices: [], listings: []}},
        "upsert" : true
      }});
    });
    collection.bulkWrite(writeOps).then(result => {
      console.log("BulkWrite completed for empty items");
    })
    // collection.updateOne({id: id}, {$setOnInsert: {id: id, prices: [], listings: []}}, {upsert: true})
    // .catch(error => console.log(error));
  }).catch(error => console.error(error));
  // axios.get("https://api.guildwars2.com/v2/commerce/prices?page=0&page_size=200").then(response => {
  //   delete response.data;
  //   console.log(response);
  // }).catch(error => console.error(error));
});