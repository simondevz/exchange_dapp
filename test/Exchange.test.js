/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const {
  tokens,
  // EVM_REVERT
} = require("./helpers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const Exchange = artifacts.require("Exchange");
const Token = artifacts.require("Token");
chai.use(chaiAsPromised);
chai.should();

contract("Exchanche", ([deployer, feeAccount, user1]) => {
  let token;
  let exchange;
  const feePercent = 10;

  beforeEach(async () => {
    token = await Token.new();
    token.transfer(user1, tokens(100), { from: deployer });
    exchange = await Exchange.new(feeAccount, feePercent);
  });

  describe("deployment", () => {
    it("tracks the fee account", async () => {
      const result = await exchange.feeAccount();
      result.should.equal(feeAccount);
    });

    it("tracks the fee percent", async () => {
      const result = await exchange.feePercent();
      result.toString().should.equal(feePercent.toString());
    });
  });

  describe("depositing tokens", () => {
    let result;
    let amount;

    beforeEach(async () => {
      amount = tokens(10);
      await token.approve(exchange.address, amount, { from: user1 });
      result = await exchange.depositToken(token.address, amount, {
        from: user1,
      });
    });

    describe("success", () => {
      it("tracks the token deposit", async () => {
        let balance;
        balance = await token.balanceOf(exchange.address);
        balance.toString().should.equal(amount.toString());

        // Check tokens on exchange
        balance = await exchange.tokens(token.address, user1);
        balance.toString().should.equal(amount.toString());
      });

      it("emits a Deposit event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Deposit");

        const event = log.args;
        event.token.should.equal(token.address, "token is correct");
        event.user.should.equal(user1, "user is correct");
        event.amount
          .toString()
          .should.equal(amount.toString(), "amount is correct");
        event.balance
          .toString()
          .should.equal(amount.toString(), "balance is correct");
      });
    });

    describe("failure", () => {});
  });
});
