# codechallengeilvm
Code challenge for the "Bonnie Situation".

But first, what is a "Bonnie Situation"? Well, according to Urban Dictionary [definiton](https://www.urbandictionary.com/define.php?term=Bonnie%20Situation), 

> A "Bonnie Situation is when you are already stuck in a particular problematic situation and there is a high risk of being discovered by third parties and it could lead you to embarassment, imprisonment, a smack-around-the-head, grounding, divorce, a severe belt-beating etc.". Nice touch!

## Answer to question
Yes, there is a solution: use a gasless transaction. Gasless transactions, or a meta-transaction is a type of transaction where a third-party relayer or sponsor pays the gas fee on behalf of the user, allowing them to perform transactions without needing to have any Ether in their account.

Here are the general steps to issue a gasless transaction using meta-transactions:

1. Create a contract that supports meta-transactions. This contract would include functions that allow users to sign a message that authorizes a relayer to submit a transaction on their behalf. The contract would then execute the transaction using its own gas, and deduct the gas fee from the user's balance.

2. Sign the transaction message using an Ethereum wallet or other signing tool. This generates a signed message that includes the details of the transaction and the authorization for the relayer to submit it.

3. Submit the signed message to a relayer or sponsor who will submit it to the Ethereum network on behalf of the user. The relayer will pay the gas fee for the transaction and deduct it from the user's balance in the meta-transaction contract.

4. Once the transaction is confirmed, the relayer or sponsor would inform the user that the transaction was successful.

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
Deployed on Goerli at address 0x40fB42247A0E532eb20A50f9E26F14a58C804cc2.

## How to use

