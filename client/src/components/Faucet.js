import React, { Component } from 'react';

class Faucet extends Component {

  //RECEIVE TOKENS FUNCTION
  receiveTokens = async (_token) => {
    const { serverStatus, accounts, tokenAlyContract, tokenDaiContract } = this.props;

    let contract = ''

    if (serverStatus !== "disconnected") {
      if (_token === "ALY") {
        contract = tokenAlyContract
      } else if (_token === "DAI") {
        contract = tokenDaiContract
      }
      if (contract !== '') {
        await contract.methods.getTokens().send({from: accounts[0]});
      }
    }
  }


  render() {

    let faucet = (
      <div className="faucet">
          <button className="closeFaucetButton" onClick={this.props.closeFaucet}>x</button>
          <p className="faucetTitle">Faucet</p>
          <div className="faucetFormContainer">
            <form className="faucetForm" onSubmit={ async (event) => {
              event.preventDefault()
              this.receiveTokens("ALY")
            } }>
              <div className="faucetFormInput">
                <button className="getTokenButton" type="submit"> Get ALY </button>
              </div>
            </form>
            <form className="faucetForm" onSubmit={ async (event) => {
              event.preventDefault()
              this.receiveTokens("DAI")
            } }>
              <div className="faucetFormInput">
                <button className="getTokenButton" type="submit"> Get DAI </button>
              </div>
            </form>
          </div>
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