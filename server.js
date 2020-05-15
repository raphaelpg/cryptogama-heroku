//CRYPTOGAMA SERVER
	//SERVER FUNCTIONS


//IMPORT LIBRARIES
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require("web3");
const fs = require('fs');

//SET PROVIDER
const seed = require('./config.js')['config']['ROPSTENPH']
const ropstenProvider = require('./config.js')['config']['INFPROVIDER']
const provider = new HDWalletProvider(seed, ropstenProvider);
const web3 = new Web3(provider);

//GET CONTRACTS ABI
const SwapJSON = require("./build/contracts/CryptogamaSwap.json");
const TokenALYJSON = require("./build/contracts/TokenERC20Aly.json");
const TokenDAIJSON = require("./build/contracts/TokenERC20Dai.json");

//GET SERVER AND CONTRACTS ADDRESSES
const contractAddresses = JSON.parse(fs.readFileSync('./databases/addresses.json', 'utf8'));
const serverAddress = contractAddresses[0].serverAddress;
const swapContractAddress = contractAddresses[0].swapContractAddress;
const alyContractAddress = contractAddresses[0].alyContractAddress;
const daiContractAddress = contractAddresses[0].daiContractAddress;

//INSTANCIATE SWAP CONTRACT
const swapContractInstance = new web3.eth.Contract(
  SwapJSON.abi,
  swapContractAddress,
);



//B.SERVER FUNCTIONS
	//1.IMPORT LIBRARIES
	//2.SEND DATA TO CLIENT
	//3.SAVE DATA RECEIVED FROM CLIENT TO DATABASE
	//4.SWAP FUNCTION
	//5.START SERVER



// //1.IMPORT LIBRARIES
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 8080;
const cors = require('cors');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({origin: '*'}));

app.use(express.static('./client/build'));


//2.SEND DATA TO CLIENT

app.get('/', (req, res) => {
	// res.send('Cryptogama server');
	res.sendFile('./client/build', 'index.html');
})

//INFORM CONTRACTS ADDRESSES
app.get('/api/data', (req, res) => {
	const data = {
		status: 'connected',
		serverAddress: serverAddress,
		swapContractAddress: swapContractAddress,
		alyContractAddress: alyContractAddress,
		daiContractAddress: daiContractAddress
	}
	res.json(data);
});

//INFORM SERVER STATUS
app.get('/api/hello', (req, res) => {
  res.send({ express: 'connected' });
});

//INFORM SWAP CONTRACT OWNER'S ADDRESS
app.get('/api/swapContractOwner', (req, res) => {
  res.send({ express: serverAddress });
});

//INFORM SWAP CONTRACT ADDRESS
app.get('/api/swapContractAddress', (req, res) => {
  res.send({ express: swapContractAddress });
});

//INFORM ALY CONTRACT ADDRESS
app.get('/api/ALYContractAddress', (req, res) => {
  res.send({ express: alyContractAddress });
});

//INFORM DAI CONTRACT ADDRESS
app.get('/api/DAIContractAddress', (req, res) => {
  res.send({ express: daiContractAddress });
});


//SEND TRADE HISTORY DATA
app.get('/api/tradeHistory', (req, res) => {
	let tradeHistory = '';
  fs.readFile('./databases/trades.json', 'utf8', function readFileCallback(err, data){
  	if (err){
      console.log("Cryptogama Log: ",err);
    } else {
	    tradeHistory = JSON.parse(data);
	  }
  	res.json({ tradeHistory });
  });
});

//SEND ORDERBOOK DATA
app.get('/api/orderBook', (req, res) => {
	let orderBook = '';
  fs.readFile('./databases/orderBook.json', 'utf8', function readFileCallback(err, data){
  	if (err){
      console.log("Cryptogama Log: ",err);
    } else {
	    orderBook = JSON.parse(data);
	  }
  	res.json({ orderBook });
  });
});



//3.SAVE DATA RECEIVED FROM CLIENT TO DATABASE

//INSERT NEW ORDER INSIDE ORDERBOOK
app.post('/api/insert', (req, res) => {

	//LOAD ORDERBOOK JSON FILE
  fs.readFile('./databases/orderBook.json', 'utf8', function readFileCallback(err, data){
    if (err){
      console.log("Cryptogama Log: ",err);
    } else {
	    let orderBook = JSON.parse(data);

	    //PUSH RECEIVED ORDER
	    if (req.body.post.type === "bid") {
	    	orderBook.DAIALY.bids.push({
	    		price: parseFloat(req.body.post.price),
	    		volume: parseFloat(req.body.post.volume), 
	    		total: parseFloat(req.body.post.total), 
	    		buyer: req.body.post.buyer, 
	    		tokenContractAddress: req.body.post.tokenContractAddress
	    	});
	    } else if (req.body.post.type === "ask") {
	    	orderBook.DAIALY.asks.push({
	    		price: parseFloat(req.body.post.price), 
	    		volume: parseFloat(req.body.post.volume), 
	    		total: parseFloat(req.body.post.total), 
	    		seller: req.body.post.seller, 
	    		tokenContractAddress: req.body.post.tokenContractAddress
	    	}); 	
	    }

	    //SORT ORDERBOOK
	    function sortDecrease(a, b){
	      if (a.price === b.price) {
	          return 0;
	      } else {
	          return (a.price > b.price) ? -1 : 1;
	      }
	    }

	    function sortIncrease(a, b){
	      if (a.price === b.price) {
	          return 0;
	      } else {
	          return (a.price < b.price) ? -1 : 1;
	      }
	    }

	    orderBook.DAIALY.bids.sort(sortDecrease);
	    orderBook.DAIALY.asks.sort(sortIncrease);

	    //SAVE ORDERBOOK INTO JSON FILE
	    json = JSON.stringify(orderBook, null, 2);
	    fs.writeFile('./databases/orderBook.json', json, 'utf8', (err) => {
			  if (err) {
			  	console.log("Cryptogama Log: ",err);
			  } else {
			  	console.log("Cryptogama Log: New order added");
			  }
			});
		}
	});

  //RESPOND TO CLIENT TO VALIDATE
  res.send(
    `Order received`,
  );
});



//4.SWAP FUNCTION

//BELOW FUNCTION PARSE THE ORDERBOOK, IF TWO ORDERS MATCH IT PERFORM THE SWAP
checkOrderbook = async () => {

	//LOAD ORDERBOOK JSON FILE
	fs.readFile('./databases/orderBook.json', 'utf8', async function readFileCallback(err, data){
    if (err){
      console.log("Cryptogama Log: ",err);
    } else {
		  let orderBook = JSON.parse(data);

		  //IF ORDERBOOK NOT EMPTY
    	if (orderBook.DAIALY.asks[0] && orderBook.DAIALY.bids[0]) {

	    	//RETRIEVE LOWEST ASKS AND HIGHEST BID PARAMETERS
		    let seller = orderBook.DAIALY.asks[0].seller;
		    let sellerTokenAddress = orderBook.DAIALY.asks[0].tokenContractAddress;	
		    let sellerPrice = orderBook.DAIALY.asks[0].price;
		    let sellerVolume = orderBook.DAIALY.asks[0].volume;
		    
		    let buyer = orderBook.DAIALY.bids[0].buyer;
		    let buyerTokenAddress = orderBook.DAIALY.bids[0].tokenContractAddress;
		    let buyerPrice = orderBook.DAIALY.bids[0].price;
		    let buyerVolume = orderBook.DAIALY.bids[0].volume;

		    //CHECK IF THEY IS A MATCH BETWEEN TWO ORDERS:
		    if (sellerPrice <= buyerPrice) {

			    //IF YES, DEFINE THE SWAP TRANSACTION PARAMETERS
			    let swapVolume = 0;
			    if (sellerVolume >= buyerVolume) {
			    	swapVolume = buyerVolume;
			    } else {
			    	swapVolume = sellerVolume;
			    }

			    fixRounding = (value, precision) => {
					  var power = Math.pow(10, precision || 0);
					  return Math.round(value * power) / power;
					}
			    let swapCost = fixRounding(swapVolume * sellerPrice, 2); 

			    //TRY SWAP
			    console.log("Cryptogama Log:",
			    	"Trying swap transaction: seller:", seller,
			    	" seller token: ", sellerTokenAddress,
			    	" volume sold: ", swapVolume,
			    	" buyer: ", buyer,
			    	" buyer token: ", buyerTokenAddress,
			    	" cost ", swapCost
			    )
					await swapContractInstance.methods.swapToken(seller, sellerTokenAddress, swapVolume*100, buyer, buyerTokenAddress, swapCost*100)
					.send({from: serverAddress, gas:3000000})
					.then(() => {
						console.log("Cryptogama Log: Swap transaction success");

						//UPDATE EACH ORDER PARAMETERS (AND REMOVE ORDER IF VOLUME IS 0)
						orderBook.DAIALY.asks[0].volume -= swapVolume;
						orderBook.DAIALY.asks[0].total = orderBook.DAIALY.asks[0].volume * orderBook.DAIALY.asks[0].price;
						if (orderBook.DAIALY.asks[0].volume == 0) {
							orderBook.DAIALY.asks.splice(0, 1);
						}
						orderBook.DAIALY.bids[0].volume -= swapVolume;
						orderBook.DAIALY.bids[0].total = orderBook.DAIALY.bids[0].volume * orderBook.DAIALY.bids[0].price;
						if (orderBook.DAIALY.bids[0].volume == 0) {
							orderBook.DAIALY.bids.splice(0, 1);
						}
						
						//SAVE ORDERBOOK IN JSON FILE
						json = JSON.stringify(orderBook, null, 2);
				    fs.writeFile('./databases/orderBook.json', json, 'utf8', (err) => {
						  if (err) {
						  	console.log("Cryptogama Log: ",err);
						  } else {
						  	console.log("Cryptogama Log: Orderbook updated");
						  }
						});

						//UPDATE TRADE HISTORY JSON FILE
						
						//LOAD TRADES JSON FILE
						fs.readFile('./databases/trades.json', 'utf8', async function readFileCallback(err, data){
					    if (err){
					      console.log("Cryptogama Log: ",err);
					    } else {
							  let tradeFile = JSON.parse(data);

							  //SET TRANSACTION TIMESTAMP
								let today = new Date();
								let dd = String(today.getDate()).padStart(2, '0');
								let mm = String(today.getMonth() + 1).padStart(2, '0');
								let yyyy = today.getFullYear();
								let time = ("0" + today.getHours()).slice(-2) + ":" + ("0" + today.getMinutes()).slice(-2) + ":" + ("0" + today.getSeconds()).slice(-2);
								today =  dd + '/' + mm + '/' + yyyy;
								nowStamp = today + ' ' + time;

								//UPDATE TRADES ARRAY
								tradeFile.trades.unshift({
									price: parseFloat(sellerPrice),
									volume: parseFloat(swapVolume),
									timestamp: nowStamp,
									epoch: Date.now()
								})

								//SAVE JSON FILE
								json = JSON.stringify(tradeFile, null, 2);
						    fs.writeFile('./databases/trades.json', json, 'utf8', (err) => {
								  if (err) {
								  	console.log("Cryptogama Log: ",err);
								  } else {
								  	console.log("Cryptogama Log: Trade history updated");
								  }
								});
							}
						})	
					})
					.catch(error => {
						console.log("Cryptogama Log: checkOrderbook error", error);
					})
					return;
		    } else {
		    	console.log("Cryptogama Log: No matching orders")
		    	return;
		    }
	    }
		}
	})
}


//SWAP CALLING CHECKORDERBOOK FUNCTION
app.get('/api/swap',async (req, res) => {
	await checkOrderbook()
	.then(() => {
		res.send({ express: 'checkOrderbookFinished' })
	})
	.catch(error => {
		console.log("Cryptogama Log: checkOrderbook error", error)
	})
});


//5.START SERVER
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));