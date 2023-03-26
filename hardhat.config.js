require("@nomiclabs/hardhat-truffle5");
require("@nomicfoundation/hardhat-toolbox");
const c = require('./configs')


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      chainId: 1
    },

    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${c.ALCHEMY_API_KEY}`,
      accounts: [c.GOERLI_DEPLOYER_PRIVATE_KEY]
    }
  }
};
