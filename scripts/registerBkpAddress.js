const { ethers } = require("hardhat");
const c = require('../configs')

async function main() {

  const abi = require('../artifacts/contracts/BonnieSituation.sol/BonnieSituation.json').abi;
  // Replace with the address of the ERC20 contract on Goerli
  const contractAddress = c.GOERLI_EXISTENT_BONNIE_CONTRACT_ADDRESS;

  const provider = new ethers.providers.AlchemyProvider("goerli", c.ALCHEMY_API_KEY);
  const signer = new ethers.Wallet(c.BONNIES_PRIVATE_KEY, provider);

  const contract = new ethers.Contract(contractAddress, abi, signer);

  const tx = await contract.registerBackup(c.BONNIES_BKP_ADDRESS);
  console.log(`Transaction hash: ${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });