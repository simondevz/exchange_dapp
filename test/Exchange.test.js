/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const {
  tokens,
  eventTester,
  EVM_REVERT,
  ETHER_ADDRESS,
  ether,
  orderTester,
} = require("./helpers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const Exchange = artifacts.require("Exchange");
const Token = artifacts.require("Token");
chai.use(chaiAsPromised);
chai.should();

contract("Exchanche", ([deployer, feeAccount, user1, user2]) => {
  let token;
  let exchange;
  const feePercent = 10;

  beforeEach(async () => {
    token = await Token.new();
    token.transfer(user1, tokens(100), { from: deployer });
    exchange = await Exchange.new(feeAccount, feePercent);
  });

  describe("deployment", async () => {
    it("tracks the fee account", async () => {
      const result = await exchange.feeAccount();
      result.should.equal(feeAccount);
    });

    it("tracks the fee percent", async () => {
      const result = await exchange.feePercent();
      result.toString().should.equal(feePercent.toString());
    });
  });

  describe("depositing ether", async () => {
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

  describe("withdraw ether", async () => {
    let result;
    let amount;

    beforeEach(async () => {
      amount = ether(5);
      await exchange.depositEther({
        from: user1,
        value: Number(amount),
      });
    });

    describe("success", async () => {
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

  describe("depositing tokens", async () => {
    let result;
    let amount;

    describe("success", async () => {
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

    describe("failure", async () => {
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

  describe("withdraw tokens", async () => {
    let result;
    let amount = tokens(10);

    describe("success", async () => {
      beforeEach(async () => {
        await token.approve(exchange.address, amount, { from: user1 });
        await exchange.depositToken(token.address, amount, {
          from: user1,
        });
        result = await exchange.withdrawToken(token.address, amount, {
          from: user1,
        });
      });

      it("withdraws the token deposited", async () => {
        const balance = await exchange.tokens(token.address, user1);
        balance.toString().should.equal("0");
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

  describe("checking balances", async () => {
    beforeEach(async () => {
      await exchange.depositEther({ from: user1, value: Number(ether(10)) });
    });

    it("returns user balance", async () => {
      const result = await exchange.balanceOf(ETHER_ADDRESS, user1);
      result.toString().should.equal(ether(10).toString());
    });
  });

  describe("fallback", async () => {
    it("refunds when ether is sent", async () => {
      await exchange
        .sendTransaction({ value: 1, from: user1 })
        .should.be.rejectedWith(EVM_REVERT);
    });
  });

  describe("making orders", async () => {
    let result;

    beforeEach(async () => {
      result = await exchange.makeOrder(
        token.address,
        tokens(1),
        ETHER_ADDRESS,
        ether(1),
        { from: user1 }
      );
    });

    it("tracks the newly created order", async () => {
      const orderCount = await exchange.orderCount();
      orderCount.toString().should.equal("1");

      const order = await exchange.orders("1");
      orderTester(order, {
        id: "1",
        user: user1,
        tokenGet: token.address,
        amountGet: tokens(1).toString(),
        tokenGive: ETHER_ADDRESS,
        amountGive: ether(1).toString(),
      });
    });

    it("emits an order event", async () => {
      eventTester(result, "Order", {
        id: "1",
        user: user1,
        tokenGet: token.address,
        amountGet: tokens(1).toString(),
        tokenGive: ETHER_ADDRESS,
        amountGive: ether(1).toString(),
      });
    });
  });

  describe("order actions", async () => {
    beforeEach(async () => {
      await exchange.depositEther({ from: user1, value: Number(ether(1)) });
      await exchange.makeOrder(
        token.address,
        tokens(1),
        ETHER_ADDRESS,
        ether(1),
        { from: user1 }
      );
    });

    describe("cancelling orders", async () => {
      let result;

      describe("success", async () => {
        beforeEach(async () => {
          result = await exchange.cancelOrders("1", { from: user1 });
        });

        it("updates cancelled orders", async () => {
          const orderCancelled = await exchange.orderCancelled(1);
          orderCancelled.should.equal(true);
        });

        it("emits a cancel order event", async () => {
          eventTester(result, "Cancel", {
            id: "1",
            user: user1,
            tokenGet: token.address,
            amountGet: tokens(1).toString(),
            tokenGive: ETHER_ADDRESS,
            amountGive: ether(1).toString(),
          });
        });
      });

      describe("failure", async () => {
        it("rejects invalid order ids", async () => {
          const invalidOrderId = 99999;
          await exchange
            .cancelOrders(invalidOrderId, { from: user1 })
            .should.be.rejectedWith(EVM_REVERT);
        });

        it("rejects unauthorized cancelations", async () => {
          await exchange
            .cancelOrders("1", { from: user2 })
            .should.be.rejectedWith(EVM_REVERT);
        });
      });
    });

    describe("fillOrder()", async () => {
      describe("Check balances after filling user1 buy Tokens order", async () => {
        beforeEach(async () => {
          // user1 deposit 1 ETHER to the exchange
          await exchange.depositEther({ from: user1, value: Number(ether(1)) });
          // user1 create order to buy 10 tokens for 1 ETHER
          await exchange.makeOrder(
            token.address,
            tokens(10),
            ETHER_ADDRESS,
            ether(1),
            { from: user1 }
          );
          // user2 gets tokens
          await token.transfer(user2, tokens(11), { from: deployer });
          // user2 approve exchange to spend his tokens
          await token.approve(exchange.address, tokens(11), { from: user2 });
          // user2 deposit tokens + fee cost (1 token) to the exchange
          await exchange.depositToken(token.address, tokens(11), {
            from: user2,
          });
          // user2 fills the order
          await exchange.fillOrder("1", { from: user2 });
        });

        it("user1 tokens balance on exchange should eq. 1", async () => {
          await (await exchange.balanceOf(token.address, user1))
            .toString()
            .should.eq(tokens(1).toString());
        });

        it("user1 ether balance on exchange should eq. 1", async () => {
          await (await exchange.balanceOf(ETHER_ADDRESS, user1))
            .toString()
            .should.eq(ether(1).toString());
        });

        it("user2 tokens balance on exchange should eq. 9.9", async () => {
          await (await exchange.balanceOf(token.address, user2))
            .toString()
            .should.eq("9900000000000000000");
        });

        it("user2 ether balance on exchange should eq. 1", async () => {
          await (await exchange.balanceOf(ETHER_ADDRESS, user2))
            .toString()
            .should.eq(ether(1).toString());
        });
      });
    });
  });
});
