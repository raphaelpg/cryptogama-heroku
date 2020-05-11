const { BN, ether, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const CryptogamaSwap = artifacts.require("CryptogamaSwap");
const TokenERC20Aly = artifacts.require("TokenERC20Aly");
const TokenERC20Dai = artifacts.require("TokenERC20Dai");

contract("TokenERC20Aly", function(accounts){
    const owner = accounts[0];
    const spender = accounts[1];
    const recipient = accounts[2];
    const _name = "ERC20 Token Aly";
    const _symbol = "ALY";
    const _decimals = 2;
    const _totalSupply = 10000000;

    //Before each unit test  
    beforeEach(async function() {
        this.TokenERC20AlyInstance = await TokenERC20Aly.new();
    });

    it("Check token name", async function() {
        expect(await this.TokenERC20AlyInstance.name.call()).to.equal(_name);
    });

    it("Check token symbol", async function() {
        expect(await this.TokenERC20AlyInstance.symbol.call()).to.equal(_symbol);
    });

    it("Check token decimals", async function() {
        expect(await this.TokenERC20AlyInstance.decimals.call()).to.be.bignumber.equal(new BN(_decimals));
    });

    it('Check totalSupply value', async function () {
        let totalSupply = await this.TokenERC20AlyInstance.totalSupply();
        expect(totalSupply).to.be.bignumber.equal(new BN(_totalSupply));
    });

    it("Check owner's balance", async function () {
        let balanceOf = await this.TokenERC20AlyInstance.balanceOf(owner);
        expect(balanceOf).to.be.bignumber.equal(new BN(_totalSupply));
    });

    it("Check approve() and allowance() function", async function () {
        let amount = new BN('10');
        await this.TokenERC20AlyInstance.approve(spender, amount, {from: owner});
        let amountApproved = await this.TokenERC20AlyInstance.allowance(owner, spender); 
        expect(amountApproved).to.be.bignumber.equal(amount);
    });

    it("Check transfer() function", async function () {
        let ownerBalanceBefore = await this.TokenERC20AlyInstance.balanceOf(owner);
        let recipientBalanceBefore = await this.TokenERC20AlyInstance.balanceOf(recipient);
        let amount = new BN('10');

        await this.TokenERC20AlyInstance.transfer(recipient, amount, {from: owner});

        let ownerBalanceAfter = await this.TokenERC20AlyInstance.balanceOf(owner);
        let recipientBalanceAfter = await this.TokenERC20AlyInstance.balanceOf(recipient);

        expect(ownerBalanceAfter).to.be.bignumber.equal(ownerBalanceBefore.sub(amount));
        expect(recipientBalanceAfter).to.be.bignumber.equal(recipientBalanceBefore.add(amount));
    });

    it("Check transferFrom() function", async function () {
        let ownerBalanceBefore = await this.TokenERC20AlyInstance.balanceOf(owner);
        let recipientBalanceBefore = await this.TokenERC20AlyInstance.balanceOf(recipient);
        let amount = new BN('10');

        await this.TokenERC20AlyInstance.approve(spender, amount, {from: owner});

        await this.TokenERC20AlyInstance.transferFrom(owner, recipient, amount, {from: spender});

        let ownerBalanceAfter = await this.TokenERC20AlyInstance.balanceOf(owner);
        let recipientBalanceAfter = await this.TokenERC20AlyInstance.balanceOf(recipient);

        expect(ownerBalanceAfter).to.be.bignumber.equal(ownerBalanceBefore.sub(amount));
        expect(recipientBalanceAfter).to.be.bignumber.equal(recipientBalanceBefore.add(amount));
    });

    it('Check getTokens() function', async function () {
        console.log("Testing getTokens() function:");

        //Verify can't get more than 10 000 ALY per call. 
        await expectRevert(this.TokenERC20AlyInstance.getTokens(1000001, {from: spender}),"Required amount must be less than 10000");
        
        let spenderBalanceBefore = await this.TokenERC20AlyInstance.balanceOf(spender);
        console.log("Spender's balance: ", parseInt(spenderBalanceBefore));
        
        let totalSupplyBefore = await this.TokenERC20AlyInstance.totalSupply();
        console.log("Total supply: ", parseInt(totalSupplyBefore));

        await this.TokenERC20AlyInstance.getTokens(1000000, {from: spender});
        console.log("Mint 1000000 tokens");
        
        let spenderBalanceAfter = await this.TokenERC20AlyInstance.balanceOf(spender);
        expect(spenderBalanceAfter).to.be.bignumber.equal(spenderBalanceBefore.add(new BN(1000000)));
        console.log("Spender's balance after mint: ", parseInt(spenderBalanceAfter));
        
        let totalSupplyAfter = await this.TokenERC20AlyInstance.totalSupply();
        expect(totalSupplyAfter).to.be.bignumber.equal(new BN(_totalSupply + 1000000));
        console.log("Total supply: ", parseInt(totalSupplyAfter));

        //Verify can't get tokens before 2min after last mint. 
        await expectRevert(this.TokenERC20AlyInstance.getTokens(1, {from: spender}),"Function can be called every two minutes only, wait");
    })

    it('Check withdrawETH() function', async function () {
        console.log("Testing withdrawETH() function:");
        let ETHValue = new BN('10000000000000000000');//10 ETH

        //Send ETH to the contract
        await web3.eth.sendTransaction({from:spender, to:this.TokenERC20AlyInstance.address, value:ETHValue});
        console.log("Send 10 ETH to contract");
        
        //Check owner balance in ETH
        let contractOwnerETHBalanceBefore = await web3.eth.getBalance(owner);
        console.log("Owner:", contractOwnerETHBalanceBefore/1000000000000000000, "ETH");

        //Check contract balance in ETH
        let TokenContractETHBalanceBefore = await web3.eth.getBalance(this.TokenERC20AlyInstance.address);
        console.log("Contract:", TokenContractETHBalanceBefore/1000000000000000000, "ETH");

        //Verify can be called by owner only. 
        await expectRevert(this.TokenERC20AlyInstance.withdrawETH({from: spender}),"Ownable: caller is not the owner");

        //Withdraw function
        await this.TokenERC20AlyInstance.withdrawETH({from:owner});
        console.log("Contract withdraw function()");

        //Check contract balance in ETH
        let TokenContractETHBalanceAfterWithdraw = await web3.eth.getBalance(this.TokenERC20AlyInstance.address);
        expect(TokenContractETHBalanceAfterWithdraw).to.be.bignumber.equal(new BN(0));
        console.log("Contract", TokenContractETHBalanceAfterWithdraw/1000000000000000000, "ETH");

        //Check owner balance in ETH
        let contractOwnerETHBalanceAfterWithdraw = await web3.eth.getBalance(owner);
        console.log("Owner", contractOwnerETHBalanceAfterWithdraw/1000000000000000000, "ETH");
    })
});

contract("TokenERC20Dai", function(accounts){
    const owner = accounts[0];
    const spender = accounts[1];
    const recipient = accounts[2];
    const _name = "ERC20 Token Dai";
    const _symbol = "DAI";
    const _decimals = 2;
    const _totalSupply = 100000000;

    //Before each unit test  
    beforeEach(async function() {
        this.TokenERC20DaiInstance = await TokenERC20Dai.new();
    });

    it("Check token name", async function() {
        expect(await this.TokenERC20DaiInstance.name.call()).to.equal(_name);
    });

    it("Check token symbol", async function() {
        expect(await this.TokenERC20DaiInstance.symbol.call()).to.equal(_symbol);
    });

    it("Check token decimals", async function() {
        expect(await this.TokenERC20DaiInstance.decimals.call()).to.be.bignumber.equal(new BN(_decimals));
    });

    it('Check totalSupply value', async function () {
        let totalSupply = await this.TokenERC20DaiInstance.totalSupply();
        expect(totalSupply).to.be.bignumber.equal(new BN(_totalSupply));
    });

    it("Check owner's balance", async function () {
        let balanceOf = await this.TokenERC20DaiInstance.balanceOf(owner);
        expect(balanceOf).to.be.bignumber.equal(new BN(_totalSupply));
    });

    it("Check approve() and allowance() function", async function () {
        let amount = new BN('10');
        await this.TokenERC20DaiInstance.approve(spender, amount, {from: owner});
        let amountApproved = await this.TokenERC20DaiInstance.allowance(owner, spender); 
        expect(amountApproved).to.be.bignumber.equal(amount);
    });

    it("Check transfer() function", async function () {
        let ownerBalanceBefore = await this.TokenERC20DaiInstance.balanceOf(owner);
        let recipientBalanceBefore = await this.TokenERC20DaiInstance.balanceOf(recipient);
        let amount = new BN('10');

        await this.TokenERC20DaiInstance.transfer(recipient, amount, {from: owner});

        let ownerBalanceAfter = await this.TokenERC20DaiInstance.balanceOf(owner);
        let recipientBalanceAfter = await this.TokenERC20DaiInstance.balanceOf(recipient);

        expect(ownerBalanceAfter).to.be.bignumber.equal(ownerBalanceBefore.sub(amount));
        expect(recipientBalanceAfter).to.be.bignumber.equal(recipientBalanceBefore.add(amount));
    });

    it("Check transferFrom() function", async function () {
        let ownerBalanceBefore = await this.TokenERC20DaiInstance.balanceOf(owner);
        let recipientBalanceBefore = await this.TokenERC20DaiInstance.balanceOf(recipient);
        let amount = new BN('10');

        await this.TokenERC20DaiInstance.approve(spender, amount, {from: owner});

        await this.TokenERC20DaiInstance.transferFrom(owner, recipient, amount, {from: spender});

        let ownerBalanceAfter = await this.TokenERC20DaiInstance.balanceOf(owner);
        let recipientBalanceAfter = await this.TokenERC20DaiInstance.balanceOf(recipient);

        expect(ownerBalanceAfter).to.be.bignumber.equal(ownerBalanceBefore.sub(amount));
        expect(recipientBalanceAfter).to.be.bignumber.equal(recipientBalanceBefore.add(amount));
    });

    it('Check getTokens() function', async function () {
        console.log("Testing getTokens() function:");

        //Verify can't get more than 100 000 DAI per call. 
        await expectRevert(this.TokenERC20DaiInstance.getTokens(10000001, {from: spender}),"Required amount must be less than 100000");
        
        let spenderBalanceBefore = await this.TokenERC20DaiInstance.balanceOf(spender);
        console.log("Spender's balance: ", parseInt(spenderBalanceBefore));
        
        let totalSupplyBefore = await this.TokenERC20DaiInstance.totalSupply();
        console.log("Total supply: ", parseInt(totalSupplyBefore));

        await this.TokenERC20DaiInstance.getTokens(10000000, {from: spender});
        console.log("Mint 10000000 tokens");
        
        let spenderBalanceAfter = await this.TokenERC20DaiInstance.balanceOf(spender);
        expect(spenderBalanceAfter).to.be.bignumber.equal(spenderBalanceBefore.add(new BN(10000000)));
        console.log("Spender's balance after mint: ", parseInt(spenderBalanceAfter));
        
        let totalSupplyAfter = await this.TokenERC20DaiInstance.totalSupply();
        expect(totalSupplyAfter).to.be.bignumber.equal(new BN(_totalSupply + 10000000));
        console.log("Total supply: ", parseInt(totalSupplyAfter));

        //Verify can't get tokens before 2min after last mint. 
        await expectRevert(this.TokenERC20DaiInstance.getTokens(1, {from: spender}),"Function can be called every two minutes only, wait");
    })

    it('Check withdrawETH() function', async function () {
        console.log("Testing withdrawETH() function:");
        let ETHValue = new BN('10000000000000000000');//10 ETH

        //Send ETH to the contract
        await web3.eth.sendTransaction({from:spender, to:this.TokenERC20DaiInstance.address, value:ETHValue});
        console.log("Send 10 ETH to contract");
        
        //Check owner balance in ETH
        let contractOwnerETHBalanceBefore = await web3.eth.getBalance(owner);
        console.log("Owner:", contractOwnerETHBalanceBefore/1000000000000000000, "ETH");

        //Check contract balance in ETH
        let TokenContractETHBalanceBefore = await web3.eth.getBalance(this.TokenERC20DaiInstance.address);
        console.log("Contract:", TokenContractETHBalanceBefore/1000000000000000000, "ETH");

        //Verify can be called by owner only. 
        await expectRevert(this.TokenERC20DaiInstance.withdrawETH({from: spender}),"Ownable: caller is not the owner");

        //Withdraw function
        await this.TokenERC20DaiInstance.withdrawETH({from:owner});
        console.log("Contract withdraw function()");

        //Check contract balance in ETH
        let TokenContractETHBalanceAfterWithdraw = await web3.eth.getBalance(this.TokenERC20DaiInstance.address);
        expect(TokenContractETHBalanceAfterWithdraw).to.be.bignumber.equal(new BN(0));
        console.log("Contract", TokenContractETHBalanceAfterWithdraw/1000000000000000000, "ETH");

        //Check owner balance in ETH
        let contractOwnerETHBalanceAfterWithdraw = await web3.eth.getBalance(owner);
        console.log("Owner", contractOwnerETHBalanceAfterWithdraw/1000000000000000000, "ETH");
    })
});


contract("CryptogamaSwap", function(accounts){
    const contractOwner = accounts[0];
    const seller = accounts[1];
    const buyer = accounts[2];
    const hacker = accounts[3];

    //Before each unit test  
    beforeEach(async function() {
        this.TokenERC20AlyInstance = await TokenERC20Aly.new({from: seller});
        this.TokenERC20DaiInstance = await TokenERC20Dai.new({from: buyer});
        this.CryptogamaSwapInstance = await CryptogamaSwap.new({from: contractOwner});
    });

    it("Check swap contract get owner function", async function() {
        expect(await this.CryptogamaSwapInstance.owner()).to.equal(contractOwner);
    });

    it("Check swap contract transferOwnership function", async function() {
        await this.CryptogamaSwapInstance.transferOwnership(seller, {from: contractOwner});
        expect(await this.CryptogamaSwapInstance.owner()).to.equal(seller);
    });

    it("Check swapToken function regarding token balances", async function() {
        let sellAmount = new BN('10000');
        let buyAmount = new BN('150000');

        console.log("Initial balances: ")

        let sellerAlyBalanceBeforeTransfer = await this.TokenERC20AlyInstance.balanceOf(seller);
        let sellerDaiBalanceBeforeTransfer = await this.TokenERC20DaiInstance.balanceOf(seller);
        console.log("Seller's balance before transfer: ALY:",parseInt(sellerAlyBalanceBeforeTransfer), " DAI:",parseInt(sellerDaiBalanceBeforeTransfer));

        let buyerDaiBalanceBeforeTransfer = await this.TokenERC20DaiInstance.balanceOf(buyer);
        let buyerAlyBalanceBeforeTransfer = await this.TokenERC20AlyInstance.balanceOf(buyer);
        console.log("Buyer's balance before transfer: ALY:",parseInt(buyerAlyBalanceBeforeTransfer), " DAI:",parseInt(buyerDaiBalanceBeforeTransfer));

        let contractDaiBalanceBeforeTransfer = await this.TokenERC20DaiInstance.balanceOf(this.CryptogamaSwapInstance.address);
        let contractAlyBalanceBeforeTransfer = await this.TokenERC20AlyInstance.balanceOf(this.CryptogamaSwapInstance.address);
        console.log("Contract's balance before transfer: ALY:",parseInt(contractAlyBalanceBeforeTransfer), " DAI:",parseInt(contractDaiBalanceBeforeTransfer));

        await this.TokenERC20AlyInstance.transfer(this.CryptogamaSwapInstance.address, sellAmount, {from: seller});
        await this.TokenERC20DaiInstance.transfer(this.CryptogamaSwapInstance.address, buyAmount, {from: buyer});

        console.log("After transfer balances: ")

        let sellerAlyBalanceBeforeSwap = await this.TokenERC20AlyInstance.balanceOf(seller);
        let sellerDaiBalanceBeforeSwap = await this.TokenERC20DaiInstance.balanceOf(seller);
        console.log("Seller's balance before swap: ALY:",parseInt(sellerAlyBalanceBeforeSwap), " DAI:",parseInt(sellerDaiBalanceBeforeSwap));

        let buyerDaiBalanceBeforeSwap = await this.TokenERC20DaiInstance.balanceOf(buyer);
        let buyerAlyBalanceBeforeSwap = await this.TokenERC20AlyInstance.balanceOf(buyer);
        console.log("Buyer's balance before swap: ALY:",parseInt(buyerAlyBalanceBeforeSwap), " DAI:",parseInt(buyerDaiBalanceBeforeSwap));

        let contractDaiBalanceBeforeSwap = await this.TokenERC20DaiInstance.balanceOf(this.CryptogamaSwapInstance.address);
        let contractAlyBalanceBeforeSwap = await this.TokenERC20AlyInstance.balanceOf(this.CryptogamaSwapInstance.address);
        console.log("Contract's balance before swap: ALY:",parseInt(contractAlyBalanceBeforeSwap), " DAI:",parseInt(contractDaiBalanceBeforeSwap));

        await this.CryptogamaSwapInstance.swapToken(
            seller,
            this.TokenERC20AlyInstance.address,
            sellAmount,
            buyer,
            this.TokenERC20DaiInstance.address,
            buyAmount
        );

        console.log("After swap balances: ")

        let sellerAlyBalanceAfter = await this.TokenERC20AlyInstance.balanceOf(seller);
        let sellerDaiBalanceAfter = await this.TokenERC20DaiInstance.balanceOf(seller);
        console.log("Seller's balance after swap: ALY:",parseInt(sellerAlyBalanceAfter), " DAI:",parseInt(sellerDaiBalanceAfter));
        
        let buyerDaiBalanceAfter = await this.TokenERC20DaiInstance.balanceOf(buyer);
        let buyerAlyBalanceAfter = await this.TokenERC20AlyInstance.balanceOf(buyer);
        console.log("Buyer's balance after swap: ALY:",parseInt(buyerAlyBalanceAfter), " DAI:",parseInt(buyerDaiBalanceAfter));

        let contractDaiBalanceAfter = await this.TokenERC20DaiInstance.balanceOf(this.CryptogamaSwapInstance.address);
        let contractAlyBalanceAfter = await this.TokenERC20AlyInstance.balanceOf(this.CryptogamaSwapInstance.address);
        console.log("Contract's balance after swap: ALY:",parseInt(contractAlyBalanceAfter), " DAI:",parseInt(contractDaiBalanceAfter));

        expect(sellerAlyBalanceAfter).to.be.bignumber.equal(sellerAlyBalanceBeforeTransfer.sub(sellAmount));
        expect(sellerDaiBalanceAfter).to.be.bignumber.equal(sellerDaiBalanceBeforeTransfer.add(buyAmount));

        expect(buyerDaiBalanceAfter).to.be.bignumber.equal(buyerDaiBalanceBeforeTransfer.sub(buyAmount));
        expect(buyerAlyBalanceAfter).to.be.bignumber.equal(buyerAlyBalanceBeforeTransfer.add(sellAmount));

        expect(contractDaiBalanceAfter).to.be.bignumber.equal(new BN('0'));
        expect(contractAlyBalanceAfter).to.be.bignumber.equal(new BN('0'));
    });

    it("Check swapToken function regarding hacker's calling", async function() {
        let sellAmount = new BN('10000');
        let buyAmount = new BN('150000');

        await this.TokenERC20AlyInstance.transfer(this.CryptogamaSwapInstance.address, sellAmount, {from: seller});
        await this.TokenERC20DaiInstance.transfer(this.CryptogamaSwapInstance.address, buyAmount, {from: buyer});

        console.log("Expect hacker call to be reverted");

        await expectRevert(this.CryptogamaSwapInstance.swapToken(
            seller,
            this.TokenERC20AlyInstance.address,
            sellAmount,
            hacker,
            this.TokenERC20DaiInstance.address,
            buyAmount,
            {from: hacker}
        ),"Ownable: caller is not the owner");

        console.log("Call reverted");
    });

    it("Check swap contract withdrawAll() function", async function() {
        let ALYAmount = new BN('2000');
        let DAIAmount = new BN('20000');

        //Check owner balance in ETH, ALY and DAI
        let contractOwnerETHBalanceBefore = await web3.eth.getBalance(contractOwner);
        console.log("Owner:", contractOwnerETHBalanceBefore/1000000000000000000, "ETH");
        let ownerALYBalanceBefore = await this.TokenERC20AlyInstance.balanceOf(contractOwner);
        console.log("Owner: ", parseInt(ownerALYBalanceBefore), "ALY");
        let ownerDAIBalanceBefore = await this.TokenERC20DaiInstance.balanceOf(contractOwner);
        console.log("Owner: ", parseInt(ownerDAIBalanceBefore), "DAI");

        //Check contract balance in ETH, ALY and DAI
        let SwapETHBalanceBefore = await web3.eth.getBalance(this.CryptogamaSwapInstance.address);
        console.log("Contract:", SwapETHBalanceBefore/1000000000000000000, "ETH");
        let contractALYBalanceBefore = await this.TokenERC20AlyInstance.balanceOf(this.CryptogamaSwapInstance.address);
        console.log("Contract:", parseInt(contractALYBalanceBefore), "ALY");
        let contractDAIBalanceBefore = await this.TokenERC20DaiInstance.balanceOf(this.CryptogamaSwapInstance.address);
        console.log("Contract:", parseInt(contractDAIBalanceBefore), "DAI");

        //Send ETH, ALY and DAI to the contract
        await web3.eth.sendTransaction({from:seller, to:this.CryptogamaSwapInstance.address, value:"10000000000000000000"});
        console.log("Send 10 ETH to contract");
        await this.TokenERC20AlyInstance.transfer(this.CryptogamaSwapInstance.address, ALYAmount, {from: seller});
        console.log("Send 2000 ALY to contract");
        await this.TokenERC20DaiInstance.transfer(this.CryptogamaSwapInstance.address, DAIAmount, {from: buyer});
        console.log("Send 20000 DAI to contract");

        //Check contract balance in ETH, ALY and DAI
        let SwapETHBalanceAfterTransaction = await web3.eth.getBalance(this.CryptogamaSwapInstance.address);
        console.log("Contract:", SwapETHBalanceAfterTransaction/1000000000000000000, "ETH");
        let contractALYBalanceAfterTransaction = await this.TokenERC20AlyInstance.balanceOf(this.CryptogamaSwapInstance.address);
        console.log("Contract:", parseInt(contractALYBalanceAfterTransaction), "ALY");
        let contractDAIBalanceAfterTransaction = await this.TokenERC20DaiInstance.balanceOf(this.CryptogamaSwapInstance.address);
        console.log("Contract:", parseInt(contractDAIBalanceAfterTransaction), "DAI");

        //Withdraw function
        await this.CryptogamaSwapInstance.withdrawAll(this.TokenERC20AlyInstance.address, this.TokenERC20DaiInstance.address, {from:contractOwner});
        console.log("Contract withdraw function()");

        //Check contract balance in ETH, ALY and DAI
        let SwapETHBalanceAfterWithdraw = await web3.eth.getBalance(this.CryptogamaSwapInstance.address);
        console.log("Contract", SwapETHBalanceAfterWithdraw/1000000000000000000, "ETH");
        let contractALYBalanceAfterWithdraw = await this.TokenERC20AlyInstance.balanceOf(this.CryptogamaSwapInstance.address);
        console.log("Contract: ", parseInt(contractALYBalanceAfterWithdraw), "ALY");
        let contractDAIBalanceAfterWithdraw = await this.TokenERC20DaiInstance.balanceOf(this.CryptogamaSwapInstance.address);
        console.log("Contract: ", parseInt(contractDAIBalanceAfterWithdraw), "DAI");

        //Check owner balance in ETH, ALY and DAI
        let contractOwnerETHBalanceAfterWithdraw = await web3.eth.getBalance(contractOwner);
        console.log("Owner", contractOwnerETHBalanceAfterWithdraw/1000000000000000000, "ETH");
        let ownerALYBalanceAfterWithdraw = await this.TokenERC20AlyInstance.balanceOf(contractOwner);
        console.log("Owner: ", parseInt(ownerALYBalanceAfterWithdraw), "ALY");
        let ownerDAIBalanceAfterWithdraw = await this.TokenERC20DaiInstance.balanceOf(contractOwner);
        console.log("Owner: ", parseInt(ownerDAIBalanceAfterWithdraw), "DAI");
    });
});