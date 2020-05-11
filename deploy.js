//CRYPTOGAMA DEPLOY SCRIPT
	//DEPLOY SWAP CONTRACT
	//DEPLOY ALY CONTRACT
	//DEPLOY DAI CONTRACT
	//SAVE CONTRACT ADDRESSES INTO JSON FILE


//IMPORT LIBRARIES
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require("web3");
const fs = require('fs');

//IMPORT CONTRACTS
const SwapJSON = require("./build/contracts/CryptogamaSwap.json");
const TokenALYJSON = require("./build/contracts/TokenERC20Aly.json");
const TokenDAIJSON = require("./build/contracts/TokenERC20Dai.json");

//SET PROVIDER
const seed = require('./config.js')['config']['ROPSTENPH']
const ropstenProvider = require('./config.js')['config']['INFPROVIDER']
const provider = new HDWalletProvider(seed, ropstenProvider);
const web3 = new Web3(provider);

//DEPLOYMENT FUNCTION
const deploySwap = async () => {

	//GET PROVIDER FIRST ACCOUNT
  const accounts = await web3.eth.getAccounts();
  console.log('Attempting to deploy Swap contract from account', accounts[0]);

  //DEPLOY SWAP CONTRACT
  const resultSwap = await new web3.eth.Contract(SwapJSON.abi)
    .deploy({data: SwapJSON.bytecode})
    .send({gas:'1000000', from: accounts[0]})
    .catch(error => {
			console.log("Cryptogama deployment error: ", error)
		})
  console.log('Swap contract deployed at:', resultSwap.options.address);

  //DEPLOY ALY CONTRACT
  console.log('Attempting to deploy ALY contract from account', accounts[0]);
  const resultALY = await new web3.eth.Contract(TokenALYJSON.abi)
    .deploy({data: TokenALYJSON.bytecode})
    .send({gas:'2000000', from: accounts[0]})
    .catch(error => {
			console.log("Cryptogama deployment error: ", error)
		})	
  console.log('ALY contract deployed at:', resultALY.options.address);

  //DEPLOY DAI CONTRACT
	console.log('Attempting to deploy DAI contract from account', accounts[0]);
  const resultDAI = await new web3.eth.Contract(TokenDAIJSON.abi)
    .deploy({data: TokenDAIJSON.bytecode})
    .send({gas:'2000000', from: accounts[0]})
    .catch(error => {
			console.log("Cryptogama deployment error: ", error)
		})
  console.log('DAI contract deployed at:', resultDAI.options.address);

  //SAVING CONTRACT ADDRESSES TO JSON FILE (DATABASE/ADDRESSES.JSON)
	let addresses = []
  addresses.push({
  	serverAddress: accounts[0],
 		swapContractAddress: resultSwap.options.address,
 		alyContractAddress: resultALY.options.address,
 		daiContractAddress: resultDAI.options.address
 	})

  json = JSON.stringify(addresses, null, 2);
  fs.writeFileSync('./databases/addresses.json', json, 'utf8', (err) => {
	  if (err) {
	  	console.log("Cryptogama writing addresses error: ",err);
	  } else {
	  	console.log("Cryptogama contract addresses added");
	  }
	})
};

//LAUNCH DEPLOYMENT THEN EXIT
const deployAll = async () => {
	await deploySwap()
	.then(() => {
		process.exit()
	})
	.catch(error => {
		console.log("Cryptogama deployment error: ", error)
	})
}

deployAll();