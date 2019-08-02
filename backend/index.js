require("dotenv").config();
const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const uri = process.env.DB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("gw2-marketeer").collection("item");
  axios.get("https://api.guildwars2.com/v2/items?page=0&page_size=200").then(response => {
    const totalPages = response.headers["x-page-total"];
    const requestUrls = [];
    for (let i = 0; i < totalPages; i++) {
      requestUrls.push(`https://api.guildwars2.com/v2/items?page=${i}&page_size=200`);
    }
    let requestIndex = 0;
    let interval = setInterval(() => {
      axios.get(requestUrls[requestIndex]).then(itemsResponse => {
        const items = itemsResponse.data;
        for (let i = 0; i < items.length; i++) {
          collection.updateOne({id: items[i].id}, {$setOnInsert: items[i]}, {upsert: true})
                    .catch(error => console.log(error));
        }
      }).catch(error => console.log(error));
      requestIndex++;
      if (requestIndex >= requestUrls.length) {
        clearInterval(interval);
        console.log("Update of " + requestUrls.length + " pages completed");
      }
    }, 150);
  }).catch(error => console.error(error));
  // client.close();
});

