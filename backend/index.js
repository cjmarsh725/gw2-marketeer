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
      data.forEach(item => {
        const entry = {
          date: new Date().toISOString(),
          buys: item.buys || null,
          sells: item.sells || null
        };
        collection.updateOne({id: item.id}, {$setOnInsert: {id: item.id, prices: []}}, {upsert: true})
                  .then(result => {
                  })
                  .catch(error => console.log(error));
        collection.updateOne({id: item.id}, {$push: {prices: entry}})
                  .catch(error => console.log(error));
      });
      console.log(`Completed updating ${data.length} items`);
    }).catch(error => console.log(error));
  }).catch(error => console.log(error));
});