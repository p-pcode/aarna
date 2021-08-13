const Web3 = require("web3");
const provider =
  "https://mainnet.infura.io/v3/1917d5037c034a66a32cdc9d4fd6cb12";
const web3Client = new Web3(new Web3.providers.HttpProvider(provider));

// The minimum ABI to get ERC20 Token balance

const minABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];

const walletAddress = "0xA10D2e55f0f87756D6f99960176120C512Eb3E15";

function tokenAddress(crypto) {
  var cryptos = {
    Ohm: {
      contract: "0x383518188C0C6d7730D91b2c03a03C837814a899",
      decimalPoint: "9",
    },
    Dai: {
      contract: "0x6b175474e89094c44da98b954eedeac495271d0f",
      decimalPoint: "18",
    },
    USDT: {
      contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimalPoint: "6",
    },
    Matic: {
      contract: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
      decimalPoint: "18",
    },
    Sushi: {
      contract: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
      decimalPoint: "18",
    },
    SushiBar: {
      contract: "0x8798249c2e607446efb7ad49ec89dd1865ff4272",
      decimalPoint: "18",
    },
    Weth: {
      contract: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      decimalPoint: "18",
    },
    UST: {
      contract: "0xa47c8bf37f92abed4a126bda807a7b7498661acd",
      decimalPoint: "18",
    },
  };
  return cryptos[crypto];
}

async function getBalance(crypto) {
  // console.log(tokenAddress(crypto).contract);
  var thisCrypto = tokenAddress(crypto);
  var contract = new web3Client.eth.Contract(minABI, thisCrypto.contract);
  var result = await contract.methods.balanceOf(walletAddress).call();
  console.log(
    crypto +
      "= " +
      (result * Math.pow(10, -1 * parseInt(thisCrypto.decimalPoint))).toFixed(2)
  );
}

const cryptoArr = [
  "Ohm",
  "Dai",
  "USDT",
  "Matic",
  "Sushi",
  "SushiBar",
  "Weth",
  "UST",
];

//print all curent tokens excluding liquidity pool tokens
async function getEther() {
  var contract = new web3Client.eth.getBalance(walletAddress);
  var result = await contract;
  console.log("Ethereum = " + (result * Math.pow(10, -18)).toFixed(2));
}

getEther();

console.log("Assets : ");
for (let i = 0; i < cryptoArr.length; i++) {
  getBalance(cryptoArr[i]);
}

// var currentBlock = web3Client.eth.blockNumber;
// var n = web3Client.eth.getTransactionCount(walletAddress, currentBlock);
// var bal = web3Client.eth.getBalance(walletAddress, currentBlock);
// for (var i=currentBlock; i >= 0 && (n > 0 || bal > 0); --i) {
//     try {
//         var block = web3Client.eth.getBlock(i, true);
//         if (block && block.transactions) {
//             block.transactions.forEach(function(e) {
//                 if (walletAddress == e.from) {
//                     if (e.from != e.to)
//                         bal = bal.plus(e.value);
//                     console.log(i, e.from, e.to, e.value.toString(10));
//                     --n;
//                 }
//                 if (walletAddress == e.to) {
//                     if (e.from != e.to)
//                         bal = bal.minus(e.value);
//                     console.log(i, e.from, e.to, e.value.toString(10));
//                 }
//             });
//         }
//     } catch (e) { console.error("Error in block " + i, e); }
// }

// class TransactionChecker {
//   constructor(address) {
//     this.address = address.toLowerCase();
//     this.web3 = new Web3(
//       "https://mainnet.infura.io/v3/1917d5037c034a66a32cdc9d4fd6cb12"
//     );
//   }

//   async checkBlock() {
//     let block = await this.web3.eth.getBlock("latest");
//     let number = block.number;
//     let transactions = block.transactions;
//     //console.log('Search Block: ' + transactions);

//     if (block != null && block.transactions != null) {
//       for (let txHash of block.transactions) {
//         let tx = await this.web3.eth.getTransaction(txHash);
//         if (this.address == tx.to.toLowerCase()) {
//           console.log(
//             "from: " +
//               tx.from.toLowerCase() +
//               " to: " +
//               tx.to.toLowerCase() +
//               " value: " +
//               tx.value
//           );
//         }
//       }
//     }
//   }
// }

// var transactionChecker = new TransactionChecker(walletAddress);
// transactionChecker.checkBlock();

///////////////////

// web3Client.eth
//     .getTransactionCount(walletAddress)
//     .then((b = console.log) => {
//       console.log(b);
//       for (var i = 0; i < b; i++) {
//         web3Client.eth.getBlock(b - i).then((Block) => {
//           a = [Block.hash];
//           console.log(a);
//           var iterator = a.values();
//           for (let elements of iterator) {
//             web3Client.eth.getTransactionFromBlock((elements)=>{
//                 console.log(elements);
//             });
//           }
//         });
//       }
//     });