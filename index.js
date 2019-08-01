require("dotenv").config();
const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const uri = process.env.DB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("gw2-marketeer").collection("item");
  axios.get("https://api.guildwars2.com/v2/items").then(response => {
    const requests = [];
    response.data.forEach(id => {
      if (id < 100) requests.push(axios.get("https://api.guildwars2.com/v2/items/" + id));
    });
    axios.all(requests).then(res => {
      const itemData = res.map(x => x.data);
      collection.insertMany(itemData, {ordered: false}).then(result => {
        console.log("Insertion completed");
      }).catch(error => {
        let indexErrors = 0;
        error.writeErrors.forEach(err => {
          if (err.code === 11000) indexErrors++;
          else console.log(err);
        });
        console.log("Total duplicates: " + indexErrors);
      });
    }).catch(error => {
      console.error(error);
    })
  }).catch(error => {
    console.error(error);
  })
    
  // client.close();
});

