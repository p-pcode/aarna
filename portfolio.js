const axios = require("axios");
const fsPromises = require("fs").promises;

const DEBANK_API_URL = "https://openapi.debank.com/v1";
const BSC_API_URL = "https://api.bscscan.com/api";
const ETH_API_URL = "https://api.etherscan.io/api";
const MATIC_API_URL = "https://api.polygonscan.com/api";

const ETH_API_KEY = "976ZBDCK467PPMR352KFIXJWJS5RDAZ99M";
const BSC_API_KEY = "2KMMID2B4T4GQ7GZMSUEFRJCVVB6D5NII6";
const MATIC_API_KEY = "GFSSNTK6SGCPIR8IT7PNKTYCPFMG135WBN";

const convertArrayToObject = (array, key) =>
  array.reduce(
    (obj, item) => ({
      ...obj,
      [item[key]]: item,
    }),
    {}
  );

const compare = (a, b) => {
  if (+a.timestamp < +b.timestamp) {
    return -1;
  }
  if (+a.timestamp > +b.timestamp) {
    return 1;
  }
  return 0;
};
const getTransactions = async (address, API_KEY, API_URL) => {
  let params = {
    module: "account",
    action: "txlist",
    address: address,
    startblock: "0",
    endblock: "999999999",
    sort: "desc",
    apikey: API_KEY,
  };
  const response = await axios.get(API_URL, {
    params: params,
  });
  if (response.data.status === "1") return response.data.result;
  else return null;
};

const getTokenTransactions = async (address, API_KEY, API_URL) => {
  let params = {
    module: "account",
    action: "tokentx",
    address: address,
    startblock: "0",
    endblock: "999999999",
    sort: "desc",
    apikey: API_KEY,
  };
  const response = await axios.get(API_URL, {
    params: params,
  });

  if (response.data.status === "1") return response.data.result;
  else return null;
};

async function main() {
  let currentTime = Date.now();
  let address = "0xa10d2e55f0f87756d6f99960176120c512eb3e15";
  // let lastYear = currentTime - 365 * 24 * 60 * 60 * 1000;
  let transactionMatrix = {};
  try {
    let params = {
      id: address,
      is_all: true,
    };
    let response = await axios.get(`${DEBANK_API_URL}/user/token_list`, {
      params,
    });
    let tokens = response.data;
    let currentAssets = {};

    tokens.map((value) => {
      if (currentAssets[value.symbol.toUpperCase()] == undefined) {
        currentAssets[value.symbol.toUpperCase()] = {
          tokenValue: value.amount,
          tokenSymbol: value.symbol,
          tokenDecimal: value.decimals,
          tokenName: value.name,
          id: value.id,
        };
      } else {
        currentAssets[value.symbol.toUpperCase()].tokenValue += value.amount;
      }
    });

    // console.log(currentAssets);

    let ethTransactions = await getTransactions(
      address,
      ETH_API_KEY,
      ETH_API_URL
    );

    let ethTokenTransactions = await getTokenTransactions(
      address,
      ETH_API_KEY,
      ETH_API_URL
    );

    let bscTokenTransactions = await getTokenTransactions(
      address,
      BSC_API_KEY,
      BSC_API_URL
    );
    let maticTokenTransactions = await getTokenTransactions(
      address,
      MATIC_API_KEY,
      MATIC_API_URL
    );

    let bscTransactions = await getTransactions(
      address,
      BSC_API_KEY,
      BSC_API_URL
    );

    let maticTransactions = await getTransactions(
      address,
      MATIC_API_KEY,
      MATIC_API_URL
    );

    let totalTransactions = {};

    let normalTransactions = [
      ...(ethTransactions ?? []),
      ...(bscTransactions ?? []),
      ...(maticTransactions ?? []),
    ];
    let tokenTransactions = [
      ...(ethTokenTransactions ?? []),
      ...(bscTokenTransactions ?? []),
      ...(maticTokenTransactions ?? []),
    ];
    let uniqueAddress = {
      eth: true,
      bnb: true,
    };

    tokenTransactions.map((transaction) => {
      let date = new Date(+transaction.timeStamp * 1000);
      date = date.toISOString().split("T")[0];
      if (totalTransactions[date] == undefined) {
        totalTransactions[date] = {
          in: [],
          out: [],
          gasFees: 0,
          blockNo: {},
        };
      }

      if (transaction.to == address) {
        totalTransactions[date].in.push({
          tokenName: transaction.tokenName,
          tokenSymbol: transaction.tokenSymbol,
          tokenDecimal: transaction.tokenDecimal,
          tokenValue:
            +transaction.value * Math.pow(10, -transaction.tokenDecimal),
        });
      } else {
        totalTransactions[date].out.push({
          tokenName: transaction.tokenName,
          tokenSymbol: transaction.tokenSymbol,
          tokenDecimal: transaction.tokenDecimal,
          tokenValue:
            +transaction.value * Math.pow(10, -transaction.tokenDecimal),
        });
        if (
          totalTransactions[date].blockNo[transaction.blockNumber] == undefined
        ) {
          totalTransactions[date].gasFees +=
            transaction.gasUsed * transaction.gasPrice * Math.pow(10, -18);
          totalTransactions[date].blockNo[transaction.blockNumber] =
            transaction.gasUsed * transaction.gasPrice * Math.pow(10, -18);
        }
      }
      if (uniqueAddress[transaction.tokenSymbol.toLowerCase()] == undefined) {
        uniqueAddress[transaction.tokenSymbol.toLowerCase()] = true;
      }
    });

    normalTransactions.map((transaction) => {
      let date = new Date(+transaction.timeStamp * 1000);
      date = date.toISOString().split("T")[0];
      if (totalTransactions[date] == undefined) {
        totalTransactions[date] = {
          in: [],
          out: [],
          gasFees: 0,
          blockNo: {},
        };
      }
      if (
        +transaction.value !== 0 &&
        +transaction.isError == 0 &&
        totalTransactions[date].blockNo[transaction.blockNumber] == undefined
      ) {
        totalTransactions[date].gasFees +=
          transaction.gasUsed * transaction.gasPrice;
        totalTransactions[date].blockNo[transaction.blockNumber] =
          transaction.gasUsed * transaction.gasPrice;
      }
      if (+transaction.value !== 0 && +transaction.isError == 0) {
        if (transaction.to == address) {
          // console.log("ETH in", +transaction.value * Math.pow(10, -18));
          totalTransactions[date].in.push({
            tokenName: "ETH",
            tokenSymbol: "ETH",
            tokenDecimal: 18,
            tokenValue: +transaction.value * Math.pow(10, -18),
          });
        } else {
          // console.log("ETH out", +transaction.value * Math.pow(10, -18));
          totalTransactions[date].out.push({
            tokenName: "ETH",
            tokenSymbol: "ETH",
            tokenDecimal: 18,
            tokenValue: +transaction.value * Math.pow(10, -18),
          });
        }
      }
    });

    for (let date in totalTransactions) {
      transactionMatrix[date] = JSON.parse(JSON.stringify(currentAssets));
      totalTransactions[date].in.map((value) => {
        if (currentAssets[value.tokenSymbol.toUpperCase()] == undefined) {
          currentAssets[value.tokenSymbol.toUpperCase()] = {
            tokenName: value.tokenName,
            tokenSymbol: value.tokenSymbol,
            tokenDecimal: value.tokenDecimal,
            tokenValue: value.tokenValue * Math.pow(10, -value.tokenDecimal),
          };
        } else {
          // if (value.tokenSymbol.toUpperCase() == "ETH") {
          //   console.log(
          //     "in",
          //     currentAssets[value.tokenSymbol.toUpperCase()].tokenValue
          //   );
          // }
          currentAssets[value.tokenSymbol.toUpperCase()].tokenValue -=
            value.tokenValue;
        }
      });
      totalTransactions[date].out.map((value) => {
        if (currentAssets[value.tokenSymbol.toUpperCase()] == undefined) {
          currentAssets[value.tokenSymbol.toUpperCase()] = {
            tokenName: value.tokenName,
            tokenSymbol: value.tokenSymbol,
            tokenDecimal: value.tokenDecimal,
            tokenValue: value.tokenValue * Math.pow(10, -value.tokenDecimal),
          };
        } else {
          currentAssets[value.tokenSymbol.toUpperCase()].tokenValue +=
            value.tokenValue;
        }
      });
    }

    let files = {};

    await Promise.all(
      Object.keys(uniqueAddress).map(async (value) => {
        try {
          let file = await fsPromises.readFile(
            `tokenPriceHistory/${value}.json`
          );
          file = JSON.parse(file);
          files[value] = file;
        } catch (err) {
          files[value] = {};
        }
      })
    );
    let startTime =
      Object.keys(totalTransactions)[Object.keys(totalTransactions).length - 1];
    let endTime = new Date().toISOString().split("T")[0];

    startTime = new Date(startTime).getTime();
    endTime = new Date(endTime).getTime();

    let newDateTimeMatrix = {};
    let lastValue;
    for (let i = startTime; i <= endTime; i += 24 * 60 * 60 * 1000) {
      let date = new Date(i).toISOString().split("T")[0];
      if (transactionMatrix[date] != undefined) {
        newDateTimeMatrix[date] = JSON.parse(
          JSON.stringify(transactionMatrix[date])
        );
        lastValue = JSON.parse(JSON.stringify(transactionMatrix[date]));
      } else {
        newDateTimeMatrix[date] = JSON.parse(JSON.stringify(lastValue));
      }
    }
    let newDateTimePortfolio = {};
    let newDateTimePortfolioArray = [];
    let csvFile = [];

    Object.keys(newDateTimeMatrix).map((date) => {
      let assetValue = 0;
      Object.values(newDateTimeMatrix[date]).map((value) => {
        value.tokenValue = +value.tokenValue.toFixed(10);
        value.tokenValue = value.tokenValue < 0 ? 0 : value.tokenValue;
        let priceHistory = files[value.tokenSymbol.toLowerCase()] ?? {};
        if (Object.keys(priceHistory).length > 0) {
          assetValue += value.tokenValue * (priceHistory[date] ?? 0);
        } else {
          assetValue += value.tokenValue * 0;
        }
        csvFile.push({
          date: date,
          symbol: value.tokenSymbol.toLowerCase(),
          amount: value.tokenValue,
          price: priceHistory[date] ?? 0,
        });
        newDateTimePortfolioArray.push({ ...value, date });
      });
      console.log(date, assetValue);
      newDateTimePortfolio[date] = assetValue;
    });

    await fsPromises.writeFile("data.json", JSON.stringify(totalTransactions));
    await fsPromises.writeFile(
      "data1.json",
      JSON.stringify(newDateTimePortfolioArray)
    );
    await fsPromises.writeFile("data2.json", JSON.stringify(transactionMatrix));
    await fsPromises.writeFile(
      "data3.json",
      JSON.stringify(newDateTimePortfolio)
    );
    await fsPromises.writeFile("data4.json", JSON.stringify(csvFile));
  } catch (err) {
    console.log(err);
    console.log(err.message);
  }
}
main();
