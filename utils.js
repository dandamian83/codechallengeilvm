const { ethers } = require("hardhat");

module.exports.generateEIP712SignatureForEmergencyTransfer = async function(bonniesAccountPrvKey, theContract) {
    // Typed data for EIP712 signature generation according to https://eips.ethereum.org/EIPS/eip-712
    const typedData = {
        types: {
            // No need to define it when used with ethers._signTypedData (its implicit)
            // EIP712Domain: [
            //     { name: "name", type: "string" },
            //     { name: "version", type: "string" },
            //     { name: "chainId", type: "uint256" },
            //     { name: "verifyingContract", type: "address" },
            // ],
            EmergencyTransfer: [
                {name: "operationCode", type: "uint8"}
            ]
        },
        primaryType: "EmergencyTransfer",
        domain: {
            name: "Bonnie Situation",
            version: "1",
            chainId: hre.network.config.chainId,
            verifyingContract: theContract.address,
        },
        message: {
            operationCode: 1
        }
    }

    const wallet = new ethers.Wallet(bonniesAccountPrvKey);
    const signature = await wallet._signTypedData(typedData.domain, typedData.types, typedData.message);

    const signatureBytes = ethers.utils.arrayify(signature);
    const r = ethers.utils.hexlify(signatureBytes.slice(0, 32));
    const s = ethers.utils.hexlify(signatureBytes.slice(32, 64));
    const v = ethers.utils.hexlify(signatureBytes.slice(64, 65));

    return {v, r, s, message: typedData.message}
}


module.exports.emptyAccount = async function(account, to) {
    let initialSenderBalance = await account.getBalance();

    // Calculate the gas limit and gas price for the transaction
    const gasPrice = await ethers.provider.getGasPrice();
    const gasLimit = ethers.BigNumber.from("21000");

    // Calculate the total cost of the transaction
    const totalCost = gasPrice.mul(gasLimit);

    // Final value to be sent
    const value = initialSenderBalance.sub(totalCost);
    // Transfer all funds from sender to receiver
    const tx = await account.sendTransaction({
        to: to.address,
        value,
        gasLimit,
        gasPrice,
    });
}