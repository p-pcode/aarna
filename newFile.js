const Web3 = require("web3");
const provider =
  "https://mainnet.infura.io/v3/1917d5037c034a66a32cdc9d4fd6cb12";
const web3Client = new Web3(new Web3.providers.HttpProvider(provider));
const axios = require("axios");
const InputDataDecoder = require("ethereum-input-data-decoder");

const fs = require("fs").promises;

async function getabi(address) {
  let response = await axios.get("https://api.etherscan.io/api", {
    params: {
      module: "contract",
      action: "getabi",
      address: address,
      apikey: "976ZBDCK467PPMR352KFIXJWJS5RDAZ99M",
    },
  });
  return response.data;
}

async function main() {
  let transactionInput1 = 0xded9382a000000000000000000000000a47c8bf37f92abed4a126bda807a7b7498661acd0000000000000000000000000000000000000000000000003ca1d651167780d100000000000000000000000000000000000000000000000e3e3d8245b03a81580000000000000000000000000000000000000000000000000141843e8a4fc609000000000000000000000000a10d2e55f0f87756d6f99960176120c512eb3e15000000000000000000000000000000000000000000000000000000006110dee60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b6b45f393ce1a2232e1f3c640afc071956891370ecbe5217cedeb0cc26188664e3aa1e8764766bb2cc6fcd1740fb74e67b3e3217df829af0a4cb5d550bc11fcbd;
  const address = "0xa10d2e55f0f87756d6f99960176120c512eb3e15";

  try {
    let params = {
      module: "account",
      action: "txlist",
      address: address,
      startblock: "0",
      endblock: "999999999",
      sort: "asc",
      // page:"1",
      // offset:"10",
      apikey: "976ZBDCK467PPMR352KFIXJWJS5RDAZ99M",
    };
    let params1 = {
      module: "account",
      action: "tokentx",
      address: address,
      startblock: "0",
      endblock: "999999999",
      sort: "asc",
      // page:"1",
      // offset:"10",
      apikey: "976ZBDCK467PPMR352KFIXJWJS5RDAZ99M",
    };

    const response = await axios.get("https://api.etherscan.io/api", {
      params: params,
    });

    const response1 = await axios.get("https://api.etherscan.io/api", {
      params: params1,
    });

    let transactions = response.data.result;
    let tokenTransactions = response1.data.result;
    let totalTransactions = [...transactions, ...tokenTransactions];
    let contractAbi = {};
    // console.log(totalTransactions.length);
    await Promise.all(
      totalTransactions.map(async (transaction) => {
        if (web3Client.utils.isHex(transaction.input)) {
          if (transaction.contractAddress != "") {
            if (contractAbi[transaction.contractAddress] == undefined) {
              let data = await getabi(transaction.contractAddress);
              if (data.status == "1")
                contractAbi[transaction.contractAddress] = JSON.parse(
                  data.result
                );
            }
          } else if (transaction.from !== address) {
            if (contractAbi[transaction.from] == undefined) {
              let data = await getabi(transaction.from);
              if (data.status == "1")
                contractAbi[transaction.from] = JSON.parse(data.result);
            }
          } else if (transaction.to !== address) {
            if (contractAbi[transaction.to] == undefined) {
              let data = await getabi(transaction.to);
              if (data.status == "1")
                contractAbi[transaction.to] = JSON.parse(data.result);
            }
          }
        }
        // console.log(contractAbi);
        // console.log()

        totalTransactions.map(async (transaction) => {
          if (web3Client.utils.isHex(transaction.input)) {
            if (contractAbi[transaction.contractAddress] != undefined) {
              let decoder = new InputDataDecoder(contractAbi[transaction.contractAddress]);
              const result = decoder.decodeData(transaction.input);
              transaction["transactionMethod"] = result.method;
            } else if (contractAbi[transaction.from] != undefined) {
              let decoder = new InputDataDecoder(contractAbi[transaction.from]);
              const result = decoder.decodeData(transaction.input);
              transaction["transactionMethod"] = result.method;
              // console.log(result);
            } else if (contractAbi[transaction.to] != undefined) {
              let decoder = new InputDataDecoder(contractAbi[transaction.to]);
              const result = decoder.decodeData(transaction.input);
              transaction["transactionMethod"] = result.method;
              // console.log(result);
            }
            console.log(transaction);
          }
        });
      })
    );

    console.log(totalTransactions);
    // await fs.writeFile('data.json', JSON.stringify(totalTransactions));

  } catch (e) {
    console.log(e);
  }
}
main();
