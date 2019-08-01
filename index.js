require("dotenv").config();
const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const uri = process.env.DB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test-db").collection("test-collection");
  collection.findOneAndUpdate({id: 2}, {$set:{name: "Baz"}}).then(result => {
    console.log("result: " + result);
  }).catch(error => {
    console.error(error);
  })
  client.close();
});



// axios.get("https://api.guildwars2.com/v2/items/19684")
// .then(response => {
//   console.log(response.data);
// })
// .catch(error => {
//   console.log("There was an error: " + error);
// })