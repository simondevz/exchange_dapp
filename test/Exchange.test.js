/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const {
  tokens,
  eventTester,
  EVM_REVERT,
  ETHER_ADDRESS,
  ether,
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

  describe("depositing ether", () => {
    let result;
    let amount;

    beforeEach(async () => {
      amount = ether(5);
      result = await exchange.depositEther({
        from: user1,
        value: Number(amount),
      });
    });

    it("tracks the ether deposit", async () => {
      const balance = await exchange.tokens(ETHER_ADDRESS, user1);
      balance.toString().should.equal(amount.toString());
    });

    it("emits a Deposit event", async () => {
      eventTester(result, "Deposit", {
        token: ETHER_ADDRESS,
        user: user1,
        amount: amount.toString(),
        balance: amount.toString(),
      });
    });
  });

  describe("withdraw ether", () => {
    let result;
    let amount;

    beforeEach(async () => {
      amount = ether(5);
      await exchange.depositEther({
        from: user1,
        value: Number(amount),
      });
    });

    describe("success", () => {
      beforeEach(async () => {
        result = await exchange.withdrawEther(amount, { from: user1 });
      });

      it("withdraws the ether deposited", async () => {
        const balance = await exchange.tokens(ETHER_ADDRESS, user1);
        balance.toString().should.equal("0");
      });

      it("emits a Withdraw event", async () => {
        eventTester(result, "Withdraw", {
          token: ETHER_ADDRESS,
          user: user1,
          amount: amount.toString(),
          balance: "0",
        });
      });
    });

    describe("failure", async () => {
      it("rejects withdraws for insufficient funds", async () => {
        await exchange
          .withdrawEther(ether(100), { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });
    });
  });

  describe("depositing tokens", () => {
    let result;
    let amount;

    describe("success", () => {
      beforeEach(async () => {
        amount = tokens(10);
        await token.approve(exchange.address, amount, { from: user1 });
        result = await exchange.depositToken(token.address, amount, {
          from: user1,
        });
      });

      it("tracks the token deposit", async () => {
        let balance;
        balance = await token.balanceOf(exchange.address);
        balance.toString().should.equal(amount.toString());

        // Check tokens on exchange
        balance = await exchange.tokens(token.address, user1);
        balance.toString().should.equal(amount.toString());
      });

      it("emits a Deposit event", async () => {
        eventTester(result, "Deposit", {
          token: token.address,
          user: user1,
          amount: amount.toString(),
          balance: amount.toString(),
        });
      });
    });

    describe("failure", () => {
      it("rejects ether deposits", async () => {
        await exchange
          .depositToken(ETHER_ADDRESS, tokens(10), { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });

      it("fails when no tokens are approved", async () => {
        await exchange
          .depositToken(token.address, tokens(10), { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });
    });
  });

  describe("withdraw tokens", () => {
    let result;
    let amount = tokens(10);

    beforeEach(async () => {
      await exchange.depositToken(token.address, amount, {
        from: user1,
      });
    });

    describe("success", () => {
      it("withdraws the token deposited", async () => {
        console.log("result (before) ==>> ", result, amount);
        result = await exchange.withdrawToken(token.address, amount, {
          from: user1,
        });

        const balance = await exchange.tokens(token.address, user1);
        console.log("balance value ===>>> ", balance);
        balance.toString().should.equal("0");
        console.log("result (after) ==>> ", result);
      });

      it("emits a Withdraw event", async () => {
        eventTester(result, "Withdraw", {
          token: token.address,
          user: user1,
          amount: amount.toString(),
          balance: "0",
        });
      });
    });

    describe("failure", async () => {
      it("rejects ether withdraws", async () => {
        await exchange
          .withdrawToken(ETHER_ADDRESS, tokens(100), { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });

      it("rejects withdraws for insufficient funds", async () => {
        await exchange
          .withdrawToken(token.address, tokens(100), { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });
    });
  });

  describe("fallback", () => {
    it("refunds when ether is sent", async () => {
      await exchange
        .sendTransaction({ value: 1, from: user1 })
        .should.be.rejectedWith(EVM_REVERT);
    });
  });
});
