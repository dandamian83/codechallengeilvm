const BonnieSituation = artifacts.require("BonnieSituation");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, ethers } = require("hardhat");
const { BN } = require("bn.js");
const {generateEIP712SignatureForEmergencyTransfer, emptyAccount} = require('../utils');

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
    
        let oldBonniesBackupAddressBalance = await theContract.balanceOf(bonniesBackupAccount.address);
        
        let {v, r, s, message} = await generateEIP712SignatureForEmergencyTransfer(bonniesAccountPrvKey, theContract);

        // Perform the emergency transfer using relayersAccount (so, no relation with Bonnie's account)
        // (here is the magik)
        await theContract.emergencyTransfer(bonniesAccount.address, message, v, r, s, {from: relayersAccount.address});
        
        const b1 = new BN(oldBonniesBackupAddressBalance);
        const b2 = new BN(bonniesBalance);
        // Assert that Bonnie's backup address now has the old balance
        assert.equal(await theContract.balanceOf(bonniesBackupAccount.address).value, b1.add(b2).value);

        // Assert that Bonnie's old address now has an empty balance
        assert.equal(await theContract.balanceOf(bonniesAccount.address), 0n);
    });

    it("Bonnie should not be albe to invoke second time emergency transfer", async function () {
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
    
        let oldBonniesBackupAddressBalance = await theContract.balanceOf(bonniesBackupAccount.address);
        
        let {v, r, s, message} = await generateEIP712SignatureForEmergencyTransfer(bonniesAccountPrvKey, theContract);
        
        // Perform the emergency transfer using relayersAccount (so, no relation with Bonnie's account)
        // (here is the magik)
        await theContract.emergencyTransfer(bonniesAccount.address, message, v, r, s, {from: relayersAccount.address});
        
        const b1 = new BN(oldBonniesBackupAddressBalance);
        const b2 = new BN(bonniesBalance);
        // Assert that Bonnie's backup address now has the old balance
        assert.equal(await theContract.balanceOf(bonniesBackupAccount.address).value, b1.add(b2).value);

        // Assert that Bonnie's old address now has an empty balance
        assert.equal(await theContract.balanceOf(bonniesAccount.address), 0n);

        try {
            await theContract.emergencyTransfer(bonniesAccount.address, message, v, r, s, {from: relayersAccount.address});
            assert.fail('Expected the function to throw an error, but it did not');
        } catch (error) {
            assert.match(
                error.message,
                /Blacklisted address/,
                'Error message does not match the expected value'
              );
        }
    });

    it("Transfer to a blacklisted address should forward the tokens to its backup address", async function () {
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
        
        let {v, r, s, message} = await generateEIP712SignatureForEmergencyTransfer(bonniesAccountPrvKey, theContract);

        // Perform the emergency transfer using relayersAccount (so, no relation with Bonnie's account)
        // (here is the magik)
        await theContract.emergencyTransfer(bonniesAccount.address, message, v, r, s, {from: relayersAccount.address});
        
        let currentBonniesBackupAddrressBalance = await theContract.balanceOf(bonniesBackupAccount.address);

        const b1 = new BN(currentBonniesBackupAddrressBalance);
        const b2 = new BN(2);

        await theContract.transfer(bonniesAccount.address, b2);

        assert.equal(await theContract.balanceOf(bonniesBackupAccount.address).value, b1.add(b2).value);
    });


  });