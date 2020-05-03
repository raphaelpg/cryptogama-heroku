import React, { Component } from 'react';

class Faucet extends Component {

  //RECEIVE TOKENS FUNCTION
  receiveTokens = async (amount, _token) => {
    const { serverStatus, accounts, tokenAlyContract, tokenDaiContract } = this.props;

    let contract = ''
    let amountToSend = 0

    if (serverStatus !== "disconnected") {
      if (_token === "ALY") {
        contract = tokenAlyContract
      } else if (_token === "DAI") {
        contract = tokenDaiContract
      }
      if (amount > 0) {
        amountToSend = amount * 100
        await contract.methods.getTokens(amountToSend).send({from: accounts[0]});
      }
    }
  }

  render() {

    let faucet = (
      <div className="faucet">
          <button className="closeFaucetButton" onClick={this.props.closeFaucet}>x</button>
          <p className="faucetTitle">Faucet</p>
          <form className="faucetForm" onSubmit={ async (event) => {
            event.preventDefault()
            const ALYAmount = this.ALYAmount.value
            this.receiveTokens(ALYAmount, "ALY")
          } }>
            
            <label>ALY amount (max 10K):</label>
            <div className="faucetFormInput">
              <input 
                className="inputFields"
                type="number"
                id="ALYAmount"
                max="10000"
                min="1"
                ref={ (input) => { this.ALYAmount = input } }
                autoComplete="off"
                required
              />
              <button className="getTokenButton" type="submit"> Get ALY </button>
            </div>

          </form>
          <form className="faucetForm" onSubmit={ async (event) => {
            event.preventDefault()
            const DAIAmount = this.DAIAmount.value
            this.receiveTokens(DAIAmount, "DAI")
          } }>
            
            <label>DAI amount (max 100K):</label>
            <div className="faucetFormInput">
              <input 
                className="inputFields"
                type="number"
                id="DAIAmount"
                max="100000"
                min="1"
                ref={ (input) => { this.DAIAmount = input } }
                autoComplete="off"
                required
              />
              <button className="getTokenButton" type="submit"> Get DAI </button>
            </div>

          </form>
          <div className="faucetComments">
            <div className="faucetAdvice">The faucet has a 2min cooldown, so if you can't get tokens try a few moment later</div>
            <div className="faucetALYContract">ALY contract address:  {this.props.tokenAlyContractAddress}</div>
            <div>DAI contract address:  {this.props.tokenDaiContractAddress}</div>
          </div>
      </div>
    );

    if (! this.props.displayFaucet) {
      faucet = null;
    }

    return (
      <div>
        {faucet}
      </div>
    );
  }
}

export default Faucet;