const BonnieSituation = artifacts.require("BonnieSituation");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, ethers } = require("hardhat");
const { BN } = require("bn.js");

const TOTAL_SUPPLY = 1000n * 10n ** 18n;

contract("theContract", (accounts) => {

    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function init() {
        
        // Contracts are deployed using the first signer/account by default
        const [owner, bonniesAccount, bonniesBackupAccount, relayersAccount] = await ethers.getSigners();
        
        // Priv key for bonniesAccount (taken from the hardhat node log)
        const bonniesAccountPrvKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

        const theContract = await BonnieSituation.new("Bonnie Situation", "BST", 18, 1000);

        return { owner, bonniesAccount, bonniesAccountPrvKey, bonniesBackupAccount, relayersAccount, theContract };
    }


    async function emptyAccount(account, to) {
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

    it("Contract should have a total of 1000 BST minted tokens", async function () {
        const { theContract } = await loadFixture(init);
        assert.equal(await theContract.totalSupply(), TOTAL_SUPPLY);
    });

    it("Owner should have all the 1000 BST initial tokens", async function () {
        const { owner, theContract } = await loadFixture(init);
        assert.equal(await theContract.balanceOf(owner.address), TOTAL_SUPPLY);
    });

    it("Owner should be able to transfer 10 BST to Bonnie", async function () {
        const { owner, bonniesAccount, theContract } = await loadFixture(init);
        await theContract.transfer(bonniesAccount.address, 10);
        assert.equal(await theContract.balanceOf(bonniesAccount.address), 10);
        assert.equal(await theContract.balanceOf(owner.address), TOTAL_SUPPLY - 10n);
    });

    it("Bonnie should not have access to her tokens because she has no Ethers", async function () {
        const { owner, bonniesAccount, theContract } = await loadFixture(init);
        
        await emptyAccount(bonniesAccount, owner);
        assert.equal(await bonniesAccount.getBalance(), 0n);
        
        await theContract.transfer(bonniesAccount.address, 1);
        assert.equal(await theContract.balanceOf(bonniesAccount.address), 1n);


        try {
            await theContract.transfer(owner.address, 1, {from: bonniesAccount.address});
            assert.fail('Expected the function to throw an error, but it did not');
        } catch (error) {
            assert.match(
                error.message,
                /Returned error: sender doesn't have enough funds to send tx./,
                'Error message does not match the expected value'
              );
        }
    });

    it("Bonnie should be able to register a backup address", async function () {
        const { owner, bonniesAccount, bonniesBackupAccount, theContract } = await loadFixture(init);

        await theContract.transfer(bonniesAccount.address, 1);

        await theContract.registerBackup(bonniesBackupAccount.address, {from: bonniesAccount.address});
        
        assert.equal(await theContract.backupAddress({from: bonniesAccount.address}), bonniesBackupAccount.address);
    });

    it("Bonnie should be albe to emergency transfer her tokens using Meta-Transactions implemented using EIP712 signatures", async function () {
        const { owner, bonniesAccount, bonniesAccountPrvKey, bonniesBackupAccount, relayersAccount, theContract } = await loadFixture(init);

        // ---------- Set up ---------------------------------------
        const bonniesBalance = 12n;
        // Bonnie gets her tokens
        await theContract.transfer(bonniesAccount.address, bonniesBalance);
        assert.equal(await theContract.balanceOf(bonniesAccount.address), bonniesBalance);

        // Bonnie is precaucious and registers a backup address
        await theContract.registerBackup(bonniesBackupAccount.address, {from: bonniesAccount.address});
        assert.equal(await theContract.backupAddress({from: bonniesAccount.address}), bonniesBackupAccount.address);

        // Bonnie gets hacked and now her account is always depleted
        await emptyAccount(bonniesAccount, owner);
        assert.equal(await bonniesAccount.getBalance(), 0n);

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

        let oldBonniesBackupAddressBalance = await theContract.balanceOf(bonniesBackupAccount.address);
        
        
        // Perform the emergency transfer using relayersAccount (so, no relation with Bonnie's account)
        // (here is the magik)
        await theContract.emergencyTransfer(bonniesAccount.address, typedData.message, v, r, s, {from: relayersAccount.address});
        
        const b1 = new BN(oldBonniesBackupAddressBalance);
        const b2 = new BN(bonniesBalance);
        // Assert that Bonnie's backup address now has the old balance
        assert.equal(await theContract.balanceOf(bonniesBackupAccount.address).value, b1.add(b2).value);

        // Assert that Bonnie's old address now has an empty balance
        assert.equal(await theContract.balanceOf(bonniesAccount.address), 0n);
    });


  });