require("dotenv").config();
const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const uri = process.env.DB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("gw2-marketeer").collection("item");
  axios.get("https://api.guildwars2.com/v2/items").then(response => {
    const requestUrls = [];
    response.data.forEach(id => {
      if (id > 1000 && id < 2000) requestUrls.push("https://api.guildwars2.com/v2/items/" + id);
    });
    let requestIndex = 0;
    let interval = setInterval(() => {
      axios.get(requestUrls[requestIndex]).then(itemResponse => {
        const item = itemResponse.data;
        collection.updateOne({id: item.id}, {$setOnInsert: item}, {upsert: true})
                  .catch(error => console.log(error));
      }).catch(error => console.log(error));
      requestIndex++;
      if (requestIndex % 100 === 0) console.log("Request number " + requestIndex + " completed");
      if (requestIndex >= requestUrls.length) {
        clearInterval(interval);
        console.log("Update of " + requestUrls.length + " items completed");
      }
    }, 150);
  }).catch(error => console.error(error));
  // client.close();
});

