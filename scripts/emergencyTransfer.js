const { ethers } = require("hardhat");
const c = require('../configs')
const {generateEIP712SignatureForEmergencyTransfer} =  require('../utils');

async function main() {

  const abi = require('../artifacts/contracts/BonnieSituation.sol/BonnieSituation.json').abi;
  // Replace with the address of the ERC20 contract on Goerli
  const contractAddress = "0x40fB42247A0E532eb20A50f9E26F14a58C804cc2";

  const provider = new ethers.providers.AlchemyProvider("goerli", c.ALCHEMY_API_KEY);
  const signer = new ethers.Wallet(c.GOERLI_DEPLOYER_PRIVATE_KEY, provider);

  const contract = new ethers.Contract(contractAddress, abi, signer);

  let {v, r, s, message} = await generateEIP712SignatureForEmergencyTransfer(c.BONNIES_PRIVATE_KEY, contract);

  const tx = await contract.registerBackup(c.BONNIES_BKP_ADDRESS);
  await contract.emergencyTransfer(c.BONNIES_ADDRESS, message, v, r, s);

  console.log(`Transaction hash: ${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });