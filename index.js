const axios = require('axios');

axios.get("https://api.guildwars2.com/v2/commerce/prices/19684")
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.log("There was an error: " + error);
})