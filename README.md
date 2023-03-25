# codechallengeilvm
Code challenge for the "Bonnie Situation".

But first, what is a "Bonnie Situation"? Well, according to Urban Dictionary [definiton](https://www.urbandictionary.com/define.php?term=Bonnie%20Situation), 

> A "Bonnie Situation is when you are already stuck in a particular problematic situation and there is a high risk of being discovered by third parties and it could lead you to embarassment, imprisonment, a smack-around-the-head, grounding, divorce, a severe belt-beating etc.". Nice touch!

### Project Initialization 
1. Use the Truffle framework for Solidity development, make sure your project
structure follows the truffle standard. Use Solidity version 0.8 or higher.
a. You may also use Hardhat + Truffle + Web3

(I'll opt in for the variant **Hardhat** + **Truffle** + **Web3.js**).

Generating a package.json from my project

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


## How to test

`yarn test`

## How to deploy


## How to use