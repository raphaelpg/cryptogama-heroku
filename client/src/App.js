//CRYPTOGAMA REACT CLIENT: 

//1.IMPORTS
//2.DAPP SET UP
//3.RENDER  



//1.IMPORTS:

//IMPORT
import React, { Component } from 'react';
import getWeb3 from './getWeb3';

//IMPORT ERC20 TOKEN CONTRACTS
import TokenERC20AlyContract from './contracts/TokenERC20Aly.json';
import TokenERC20DaiContract from './contracts/TokenERC20Dai.json';
import SwapAlyContract from './contracts/SwapAly.json';

//IMPORT COMPONENTS
import Header from './components/Header';
import TokenSelector from './components/TokenSelector';
import Faucet from './components/Faucet';
import UserBalance from './components/UserBalance';
import TradeHistory from './components/TradeHistory';
import Graph from './components/Graph';
import Orderbook from './components/Orderbook';
import BuyForm from './components/BuyForm';
import SellForm from './components/SellForm';

//IMPORT FUNCTIONS
import { getServerData, displayOrderBook, displayTradeHistory, getTradeGraphData, updateTradeGraphData, getUserBalance } from './utils/serverInteractionsFunctions';

//IMPORT CSS AND TOKENS LOGOS
import './App.css';


class App extends Component {

//2.DAPP SET UP

  //STATE SET UP
  constructor(props) {
    super(props);
    this.state = { 
      web3: null,
      accounts: null,
      swapAlyContract: null,
      swapAlyOwner: null,
      swapAlyContractAddress: null,
      tokenAlyContract: null,
      tokenAlyContractAddress: null,
      tokenDaiContract: null,
      tokenDaiContractAddress: null,
      _orderBookBids: [],
      _orderBookAsks: [],
      tradeHistory: [],
      tradeGraph: [],
      serverStatus: '',
      pushedOrder: '',
      bestSellerPrice: 0,
      bestBuyerPrice: 0,
      buyInputPrice: 0,
      buyInputVolume: 0,
      buyInputTotal: '',
      sellInputPrice: 0,
      sellInputVolume: 0,
      sellInputTotal: '',
      ALYBalance: 0,
      DAIBalance: 0,
      displayFaucet: false,
    }
    this.getServerData = getServerData.bind(this);
    this.displayOrderBook = displayOrderBook.bind(this);
    this.displayTradeHistory = displayTradeHistory.bind(this);
    this.getTradeGraphData = getTradeGraphData.bind(this);
    this.updateTradeGraphData = updateTradeGraphData.bind(this);
    this.getUserBalance = getUserBalance.bind(this);
    
    this.getServerData();
    this.getTradeGraphData();
  }

  //DAPP CONFIGURATION
  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      const instanceTokenAly = new web3.eth.Contract(
        TokenERC20AlyContract.abi,
        this.state.tokenAlyContractAddress,
      );

      const instanceTokenDai = new web3.eth.Contract(
        TokenERC20DaiContract.abi,
        this.state.tokenDaiContractAddress,
      );

      const instanceSwapAly = new web3.eth.Contract(
        SwapAlyContract.abi,
        this.state.swapAlyContractAddress,
      );

      //SET PARAMETERS TO THE STATE
      this.setState({ 
        web3, 
        accounts, 
        tokenAlyContract: instanceTokenAly,
        tokenDaiContract: instanceTokenDai,
        swapAlyContract: instanceSwapAly,
      })
    } catch (error) {
      alert(
        `No wallet detected.\nAdd a crypto wallet such as Metamask to your browser.`,
      );
      console.error(error);
    } finally {
      this.displayOrderBook();
      this.displayTradeHistory();

      if (this.state.web3) {
      this.getUserBalance();
        
      //ALY ERC-20 APPROVE EVENT
      this.state.tokenAlyContract.events.Transfer({ fromBlock: 'latest', toBlock: 'latest' },
      async (error, event) => {
        console.log("Transfer ALY: ",event)
        this.displayOrderBook()
        this.getUserBalance()
      })

      //DAI ERC-20 APPROVE EVENT
      this.state.tokenDaiContract.events.Transfer({ fromBlock: 'latest', toBlock: 'latest' },
      async (error, event) => {
        console.log("Transfer DAI: ",event)
        this.displayOrderBook()
        this.getUserBalance()
      })

      //SWAP CONTRACT EVENT, TRIGGER UPDATE USER BALANCE, UPDATE ORDERBOOK, UPDATE TRADE HISTORY
      this.state.swapAlyContract.events.TokenExchanged({ fromBlock: 'latest', toBlock: 'latest'},
      async (error, event) => {
        this.getUserBalance()
        this.displayOrderBook()
        this.displayTradeHistory()
        this.updateTradeGraphData() 
      })
    }
    }
  }


  //3.RENDER

  render() {
    // if (!this.state.web3) {
    //   return <div>Loading Web3, accounts, and contract...</div>;
    // }

    return (
      <div className="App">
        <Header serverStatus={ this.state.serverStatus } />  
        <div className="navbar">
          <TokenSelector />
          <div className="balanceAndFaucet">
            <UserBalance 
              ALYBalance = { this.state.ALYBalance }
              DAIBalance = { this.state.DAIBalance }
            />
            <button className="displayFaucetButton" onClick={(e) => this.setState({ displayFaucet:true })}>Open faucet</button>
            <Faucet 
              serverStatus = { this.state.serverStatus }
              displayFaucet={ this.state.displayFaucet } 
              closeFaucet={(e) => this.setState({ displayFaucet:false })}
              accounts = { this.state.accounts }
              tokenAlyContract = { this.state.tokenAlyContract }
              tokenAlyContractAddress = { this.state.tokenAlyContractAddress }
              tokenDaiContract = { this.state.tokenDaiContract }
              tokenDaiContractAddress = { this.state.tokenDaiContractAddress }
            />
          </div>
        </div>
        <div className="Main">
          <div className="MainLeft">
            <TradeHistory />            
          </div>
          <div className="MainCenter">
            <Graph tradeGraph = { this.state.tradeGraph } />
            <div className="buySellToken">
              <BuyForm 
                serverStatus = { this.state.serverStatus }
                bestSellerPrice = { this.state.bestSellerPrice }
                accounts = { this.state.accounts }
                swapAlyContractAddress = { this.state.swapAlyContractAddress }
                tokenDaiContract = { this.state.tokenDaiContract }
                tokenDaiContractAddress = { this.state.tokenDaiContractAddress }
              />
              <SellForm 
                serverStatus = { this.state.serverStatus }
                bestSellerPrice = { this.state.bestSellerPrice }
                accounts = { this.state.accounts }
                swapAlyContractAddress = { this.state.swapAlyContractAddress }
                tokenAlyContract = { this.state.tokenAlyContract }
                tokenAlyContractAddress = { this.state.tokenAlyContractAddress }
              />
            </div>
          </div>
          <div className="MainRight">
            <Orderbook bestSellerPrice={ this.state.bestSellerPrice } />
          </div>
        </div>
      </div>
    );
  }
}

export default App;


