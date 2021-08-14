var express = require("express");
var axios = require("axios");
var cors = require('cors')
var newToken = require("./newToken.json");

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors())


function compare( a, b ) {
  if ( +a.timestamp < +b.timestamp ){
    return -1;
  }
  if ( +a.timestamp > +b.timestamp ){
    return 1;
  }
  return 0;
}


// 1) Add a route that answers to all request types
app.route("/transactions/:id").get(async function (req, res) {
  let address = req.params.id;
  let params = {
    module: "account",
    action: "txlist",
    address: address,
    startblock: "0",
    endblock: "999999999",
    sort: "asc",
    apikey: "8HBQP2E7ZP491HMCK1KK4R45RDW258PDJH",
  };
  let params1 = {
    module: "account",
    action: "tokentx",
    address: address,
    startblock: "0",
    endblock: "999999999",
    sort: "asc",
    apikey: "8HBQP2E7ZP491HMCK1KK4R45RDW258PDJH",
  };
  
  const response = await axios.get("https://api.etherscan.io/api", {
    params: params,
  });

  const response1 = await axios.get("https://api.etherscan.io/api", {
    params: params1,
  });


  let transactions = response.data.result;
  let tokenTransactions = response.data.result;
  let totalTransactions = [...transactions,...tokenTransactions];

  totalTransactions.sort(compare)
  

  totalTransactions.map((transaction) => {
    if (newToken[transaction["from"]] != undefined) {
      transaction["toLogo"] = `${newToken[transaction["from"]]["symbol"]} ( ${newToken[transaction["from"]]["type"] ?? "Not Found"})`;
    }
    if (newToken[transaction["to"]] != undefined) {
      transaction["toLogo"] = `${newToken[transaction["to"]]["symbol"]} ( ${newToken[transaction["to"]]["type"] ?? ""})`;
    }
    if (transaction["from"] === address) {
      transaction["fromLogo"] = "MyWallet";
    }
    if (transaction["to"] === address) {
      transaction["toLogo"] = "MyWallet";    }


    // const { timeStamp, from, to , fromLogo, toLogo, val  } =

  });
  res.json(transactions).status(200);
});

app.use(function (req, res, next) {
  res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
});

app.listen(3000, function () {
  console.log("Example app listening on port 3000.");
});
