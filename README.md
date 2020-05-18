![Cryptogama title](https://github.com/raphaelpg/Cryptogama/blob/master/images/Title.PNG)

Cryptogama is a decentralized ERC-20 token exchange student project.  

For teaching purposes only, it allows you to place buy and sell orders to exchange two tokens: the ALY and the DAI.
Contracts have been deployed on Ropsten and you can test the app at https://cryptogama.herokuapp.com/ 

This project has been developed and tested on a UNIX operating system.  
Compatibility with other OS not tested yet.


## Interact with the app

Once the app started, select the network 7545 in Metamask.

Three Metamask accounts are used:  
	Account #1: owner of the App  
	Account #2: the owner of ALY ERC-20 tokens  
	Account #3: the owner of DAI ERC-20 tokens  

Important: after changing account in Metamask, refresh the browser for the change to be considered.  

Select the account#2 in Metamask and place a Sell order, setting the price and the volume of ALY you want to sell and clicking on the Sell button.  
![Cryptogama title](https://github.com/raphaelpg/Cryptogama/blob/master/images/Sell.PNG)  
The order should appear in the order book.  
![Cryptogama title](https://github.com/raphaelpg/Cryptogama/blob/master/images/Orderbook.PNG)  

Select the account#3 in Metamask, refresh the browser, place a Buy order with the same price to exchange tokens with account#2.  
![Cryptogama title](https://github.com/raphaelpg/Cryptogama/blob/master/images/Buy.PNG)  
The exchange is automaticaly done when two orders have a matching price.  
It can take some time to process, wait untill the Trade History and the Graph are updated.  
![Cryptogama title](https://github.com/raphaelpg/Cryptogama/blob/master/images/Graph.PNG)  

You can check each token's balance in the App and in Metamask.  
![Cryptogama title](https://github.com/raphaelpg/Cryptogama/blob/master/images/Balnce.PNG)


## Deployment

Contracts are deployed on Ropsten testnet.  
Public addresses will be displayed later.
Contract addresses:  
Swap contract: 0xBBD1db9BdcDcC063be709b5f389cab42101756a4  
ALY Token contract address: "0x24416B5267CBdC6d306aa7DbFA139F61ce183d1D"  
DAI Token contract address: "0x27424B934bB5464a0441F2Ffb1001588B1E5Ac39"  


## Security

This project is a prototype for learning purposes, it is not recommended to use it on the mainnet.  
Contracts haven't been audited.


## Built With

* [Solidity](https://solidity.readthedocs.io/en/v0.6.0/#) - For smart contracts development - v0.5.12  
* [Truffle](https://www.trufflesuite.com/docs/truffle/overview) - Development environment and testing framework for blockchains using the Ethereum Virtual Machine v5.1.2  
* [Ganache](https://www.trufflesuite.com/docs/ganache/overview) - Personal blockchain for Ethereum development - v6.7.0  
* [Node.js](https://nodejs.org/en/docs/) - Node.js is designed to build scalable network applications - v10.16.3  
* [Express](https://expressjs.com/en/4x/api.html) - Fast, unopinionated, minimalist web framework for Node.js - v4.16.4  
* [web3js](https://web3js.readthedocs.io/en/v1.2.1/web3.html) - Used to interact with Ethereum blockchain and smart contracts - v1.2.1  
* [React](https://reactjs.org/) - A JavaScript library for building user interfaces - v16.12.0  
* [Highcharts](https://api.highcharts.com/highcharts/) - Highcharts makes it easy for developers to set up interactive charts - v8.0.0  
* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - ECMAScript 2018 - v9  


## Authors

* **Raphael Pinto Gregorio** - https://github.com/raphaelpg/

