const axios = require("axios");
const fsPromises = require("fs").promises;

const convertArrayToObject = (array, key) =>
  array.reduce(
    (obj, item) => ({
      ...obj,
      [item[key]]: item,
    }),
    {}
  );

const main = async () => {
  let tokenSymbol = [
    "OHM",
    "DAI",
    "SUSHI",
    "MATIC",
    "xSUSHI",
    "UST",
    "USDT",
    "ETH",
    "Cake",
    "bBADGER",
    "EVER",
    "BTCB",
    "ALICE",
    "BNB",
    "WETH",
    // "JustForFun",
    // "BuyItUp",
    // "SLP",
    // "Cake-LP",
  ];

  let tokenFile = await fsPromises.readFile("tokensList.json");
  tokenFile = JSON.parse(tokenFile);
  //   tokenFile = convertArrayToObject(tokenFile, "symbol");
  //   await fsPromises.writeFile("tokensList.json", JSON.stringify(tokenFile));

  tokenSymbol = tokenSymbol.map((value) => value.toLowerCase());

  await Promise.all(
    tokenSymbol.map(async (value) => {
      let response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${tokenFile[value].id}/market_chart?vs_currency=usd&days=365&interval=daily`
      );
      let prices = response.data.prices;
      let priceObject = {};
      prices = prices.reverse();
      prices.map((price) => {
        priceObject[new Date(price[0]).toISOString().split("T")[0]] = price[1];
      });

      await fsPromises.writeFile(
        `tokenPriceHistory/${value}.json`,
        JSON.stringify(priceObject)
      );
    })

    //   });
  );
};

main();
