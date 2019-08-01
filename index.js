require("dotenv").config();
const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const uri = process.env.DB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test-db").collection("test-collection");
  axios.get("https://api.guildwars2.com/v2/items").then(response => {
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(axios.get("https://api.guildwars2.com/v2/items/" + response.data[i]));
    }
    axios.all(requests).then(res => {
      const itemData = res.map(x => x.data);
      collection.insertMany(itemData, {ordered: false}).catch(error => {
        let indexErrors = 0;
        error.writeErrors.forEach(err => {
          if (err.code === 11000) indexErrors++;
          else console.log(err);
        });
        console.log("Total duplicates: " + indexErrors);
      });
    }).catch(err => {
      console.error(err);
    })
    // response.data.forEach(id => {
    //   console.log(id);
    //   axios.get("https://api.guildwars2.com/v2/items/" + id).then(itemResponse => {
    //     console.log(response.data);
    //   })
    // });
  }).catch(error => {
    console.error(error);
  })
  // collection.findOneAndUpdate({id: 2}, {$set:{name: "Baz"}}).then(result => {
  //   // console.log("result: " + result);
  // }).catch(error => {
  //   console.error(error);
  // })
    
  // client.close();
});

