# codechallengeilvm
Code challenge for the "Bonnie Situation".

But first, what is a "Bonnie Situation"? Well, according to Urban Dictionary [definiton](https://www.urbandictionary.com/define.php?term=Bonnie%20Situation), 

> A "Bonnie Situation is when you are already stuck in a particular problematic situation and there is a high risk of being discovered by third parties and it could lead you to embarassment, imprisonment, a smack-around-the-head, grounding, divorce, a severe belt-beating etc.". Nice touch!

The solution to our situation would be **Meta Transactions**, implemented with the help of **EIP712** signatures.

### Project Initialization 

Prerequisites: `node.js` v. ^16.14.2 and `npm` v. ^9.6.2.

Generating a package.json for my project

`npm init --yes`

Adding Hardhat as a development dependency

`npm install --save-dev hardhat`

Generating the Hardhat project structure

`npx hardhat`

Adding required dependencies

`npm install --save-dev "hardhat@^2.13.0" "@nomicfoundation/hardhat-toolbox@^2.0.0"`

Adding the Truffle and Web3.js specific dependencies

`npm install --save-dev @nomiclabs/hardhat-truffle5 @nomiclabs/hardhat-web3 web3`

Enable the Truffle 5 pulgin in Hardhat by requiring it in the hardhatconfig.js

`require("@nomiclabs/hardhat-truffle5");`

Adding OpenZeppelin contracts as dependencies

`npm install @openzeppelin/contracts`


## How to install

Start a local Hardhat node

`yarn start:local`

Compile the smart contract

`yarn compile`

Deploy the smart contract on the local Hardhat node

`yarn deploy:local`

## How to test

To run the unit tests

`yarn test`

## How to deploy
You can find the contract already on Goerli network at address [0x40fB42247A0E532eb20A50f9E26F14a58C804cc2](https://goerli.etherscan.io/address/0x40fB42247A0E532eb20A50f9E26F14a58C804cc2).

## How to use

First, you would need at least three accounts: Deployer (Owner of the Smart Contract), Bonnie's Wallet and Bonnies's Backup Address. As well as api keys from Alchemy (but for now you can use mine) to interact with Goerli test network. All these should be configured in the `config.js` file as follows:
    
    ALCHEMY_API_KEY: <your-Alchemy-app-key>,
    GOERLI_DEPLOYER_PRIVATE_KEY: <your-owner-account-private-key>,
    GOERLI_EXISTENT_BONNIE_CONTRACT_ADDRESS: <the-address-of-the-deployed-smart-contract>, // filled after the deployment
    BONNIES_PRIVATE_KEY: <Bonnies-account-private-key>,
    BONNIES_ADDRESS: <Bonnies-account-address>,
    BONNIES_BKP_ADDRESS: <Bonnies-backup-address>,

Deploy the smart contract on Goerli network

`yarn deploy:goerli`

Send 10 BST tokens to Bonnie's wallet

`yarn sendTokensToBonnie:goerli`

Register a backup address for Bonnies (should have some ethers in her wallet)

`registerBkpAddressForBonnie:goerli`

Issue emergency transfer on behalf of Bonnie

`yarn emergencyTransfer:goerli`

## Goerli demo

1. Contract creation [tx](https://goerli.etherscan.io/tx/0x81d405a3ae83819adbb602d02f89be65c452d3e7611818b3304cb2746a086709)

2. Bonnie receives 10 BST [tx](https://goerli.etherscan.io/tx/0x9b10699bbc67da8efa79f86805bb43948ac02fccedd186dfd8a9ba1cfbcb71e5)

3. Bonnie registers a backup address [tx](https://goerli.etherscan.io/tx/0x31fc538affda83ab63918f7e00afe5a3962a6ac8ae9c3de1d5478aa7ad620bea)

4. Some address (it happens to be the owner), performs the emergency transfer for Bonnie, transferring all her tokens to her backup address [tx](https://goerli.etherscan.io/tx/0x08407ae74272d03c8eaaedb503a03cd1b792e51be7be64a1704cbd04af2f779c)