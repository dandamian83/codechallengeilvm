const BonnieSituation = artifacts.require("BonnieSituation");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const TOTAL_SUPPLY = 1000n * 10n ** 18n;

// Traditional Truffle test
contract("BonnieSituation", (accounts) => {

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function init() {
        
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const bonnieSituation = await BonnieSituation.new("Bonnie Situation", "BST", 18, 1000);

        return { owner, otherAccount, bonnieSituation };
    }


    it("Should have a total of 1000 BST minted tokens", async function () {
        const { owner, bonnieSituation } = await loadFixture(init);
        assert.equal(await bonnieSituation.totalSupply(), TOTAL_SUPPLY);
    });

    it("Owner should have all the 1000 BST initially minted tokens", async function () {
        const { owner, bonnieSituation } = await loadFixture(init);
        assert.equal(await bonnieSituation.balanceOf(owner.address), TOTAL_SUPPLY);
    });

    it("Owner should transfer 10 BST to otherAccount", async function () {
        const { owner, otherAccount, bonnieSituation } = await loadFixture(init);
        await bonnieSituation.transfer(otherAccount.address, 10);
        assert.equal(await bonnieSituation.balanceOf(otherAccount.address), 10);
        assert.equal(await bonnieSituation.balanceOf(owner.address), TOTAL_SUPPLY - 10n);
    });

  });