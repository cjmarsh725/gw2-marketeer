require("dotenv").config();
const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const uri = process.env.DB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("gw2-marketeer").collection("market");
  axios.get("https://api.guildwars2.com/v2/commerce/prices?page=0&page_size=200").then(initialResponse => {
    const totalPages = initialResponse.headers["x-page-total"];
    const requests = [];
    for (let i = 0; i < totalPages; i++) {
      requests.push(axios.get(`https://api.guildwars2.com/v2/commerce/prices?page=${i}&page_size=200`));
    }
    let data = [];
    axios.all(requests).then(response => {
      response.forEach(res => data = data.concat(res.data));
      console.log(data.length);
    }).catch(error => console.log(error));
    // for (let i = 0; i < items.length; i++) {
    //   collection.updateOne({id: items[i].id}, {$setOnInsert: items[i]}, {upsert: true})
    //             .catch(error => console.log(error));
    // }
  }).catch(error => console.error(error));
  // axios.get("https://api.guildwars2.com/v2/commerce/prices").then(response => {
  //   const writeOps = [];
  //   response.data.forEach(id => {
  //     writeOps.push({ updateOne: {
  //       "filter" : {"id" : id},
  //       "update" : {$setOnInsert: {id: id, prices: []}},
  //       "upsert" : true
  //     }});
  //   });
  //   collection.bulkWrite(writeOps).then(result => {
  //     console.log("BulkWrite completed for empty items");
  //   })
  //   // collection.updateOne({id: id}, {$setOnInsert: {id: id, prices: [], listings: []}}, {upsert: true})
  //   // .catch(error => console.log(error));
  // }).catch(error => console.error(error));
  // axios.get("https://api.guildwars2.com/v2/commerce/prices?page=0&page_size=200").then(response => {
  //   delete response.data;
  //   console.log(response);
  // }).catch(error => console.error(error));
});