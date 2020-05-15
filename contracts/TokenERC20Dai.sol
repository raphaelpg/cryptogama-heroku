pragma solidity ^0.6.2;

import "./ERC20.sol";
import "./Ownable.sol";

/// @title ALY ERC-20 contract
/// @author Raphael Pinto Gregorio
/// @notice Basic ERC-20 token based on OpenZepellin ERC-20 standard
/// @dev The token has all classic ERC-20 functions: totalSupply(), balanceOf(), transfer(), allowance(), approve(), transferFrom(). It has two decimals.
contract TokenERC20Dai is ERC20, Ownable {
    string public name;
    string public symbol;
    uint256 public decimals;
    uint256 public _totalSupply;
    address payable private _owner;
    uint256 private lastExecutionTime;

    event ContractEmptied(address indexed to, uint256 ETHAmount);
    event TokenMinted(address indexed to, uint256 DAIAmount);

    constructor() payable public {
        name = "ERC20 Token Dai";
        symbol = "DAI";
        decimals = 2;
        _owner = msg.sender;
        lastExecutionTime = 0;
        
        _mint(msg.sender, 100000000);
    }

    receive() external payable {}

    /// @notice send tokens to the msg.sender 
    /// @dev mint fix amount of tokens and transfer them to the msg.sender
    /// An event TokenMinted containing the receiver address (msg.sender) and the token amount sent is emitted
    function getTokens() public {
        uint256 executionTime = now;
        require(executionTime >= lastExecutionTime + 2 * 1 minutes, "Function can be called every two minutes only, wait");

        lastExecutionTime = now;
        _mint(msg.sender, 100000);
        emit TokenMinted(msg.sender, 100000);
    }

    /// @notice withdraw ETH stuck in the contract 
    /// @dev transfer contract's ETH to current owner, emit an event called ContractEmptied
    /// An event SwapContractEmptied containing the owner address and the ETH amount sent is emitted
    function withdrawETH() external onlyOwner {
        address payable self = address(this);
        uint256 ETHbalance = self.balance;

        _owner.transfer(ETHbalance);
        emit ContractEmptied(_owner, ETHbalance);
    }
}