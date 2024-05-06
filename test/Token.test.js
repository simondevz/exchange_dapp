/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { tokens, EVM_REVERT, eventTester } = require("./helpers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const Token = artifacts.require("Token");
chai.use(chaiAsPromised);
chai.should();

contract("Token", ([deployer, recieiver, exchange]) => {
  const name = "Simondevz Exchange Token";
  const symbol = "SET";
  const decimal = "18";
  const totalSupply = tokens(1000000);
  let token;

  beforeEach(async () => {
    token = await Token.new();
  });

  describe("deployment", () => {
    it("tracks the name", async () => {
      const result = await token.name();
      result.should.equal(name);
    });

    it("tracks the symbol", async () => {
      const result = await token.symbol();
      result.should.equal(symbol);
    });

    it("tracks the decimal", async () => {
      const result = await token.decimals();
      result.toString().should.equal(decimal);
    });

    it("tracks the total supply", async () => {
      const result = await token.totalSupply();
      result.toString().should.equal(totalSupply.toString());
    });

    it("assigns the total supply", async () => {
      const result = await token.balanceOf(deployer);
      result.toString().should.equal(totalSupply.toString());
    });
  });

  describe("sending tokens", () => {
    let amount;
    let result;

    describe("succcess", async () => {
      beforeEach(async () => {
        amount = tokens(110);
        result = await token.transfer(recieiver, amount, {
          from: deployer,
        });
      });

      it("transfers token balances", async () => {
        let balanceOf;
        balanceOf = await token.balanceOf(deployer);
        balanceOf.toString().should.equal((totalSupply - amount).toString());
        balanceOf = await token.balanceOf(recieiver);
        balanceOf.toString().should.equal(amount.toString());
      });

      it("emits a transfer event", async () => {
        eventTester(result, "Transfer", {
          from: deployer,
          to: recieiver,
          value: amount.toString(),
        });
      });
    });

    describe("failure", async () => {
      it("rejects insufficient balance", async () => {
        let invalidAmount;
        invalidAmount = tokens(1000000000);
        await token
          .transfer(recieiver, invalidAmount, { from: deployer })
          .should.be.rejectedWith(EVM_REVERT);

        // Transfer should fail when you have none
        invalidAmount = tokens(10);
        await token
          .transfer(deployer, invalidAmount, { from: recieiver })
          .should.be.rejectedWith(EVM_REVERT);
      });

      it("Rejects invalid recipients", async () => {
        await token
          .transfer(0x0, amount, { from: deployer })
          .should.be.rejectedWith("invalid address");
      });
    });
  });

  describe("Approving tokens", () => {
    let result;
    let amount;

    beforeEach(async () => {
      amount = tokens(100);
      result = await token.approve(exchange, amount, { from: deployer });
    });

    describe("success", () => {
      it("allocates an allowance for delegated token spending on exchange", async () => {
        const allowance = await token.allowance(deployer, exchange);
        allowance.toString().should.equal(amount.toString());
      });

      it("emits a Approval event", async () => {
        eventTester(result, "Approval", {
          owner: deployer,
          spender: exchange,
          value: amount.toString(),
        });
      });
    });

    describe("failure", () => {
      it("Rejects invalid recipients", async () => {
        await token
          .approve(0x0, amount, { from: deployer })
          .should.be.rejectedWith("invalid address");
      });
    });
  });

  describe("delegated token transfers", () => {
    let amount;
    let result;

    beforeEach(async () => {
      amount = tokens(100);
      await token.approve(exchange, amount, { from: deployer });
    });

    describe("succcess", async () => {
      beforeEach(async () => {
        result = await token.transferFrom(deployer, recieiver, amount, {
          from: exchange,
        });
      });

      it("transfers token balances", async () => {
        let balanceOf;
        balanceOf = await token.balanceOf(deployer);
        balanceOf.toString().should.equal((totalSupply - amount).toString());
        balanceOf = await token.balanceOf(recieiver);
        balanceOf.toString().should.equal(amount.toString());
      });

      it("resets the allowance", async () => {
        const allowance = await token.allowance(deployer, exchange);
        allowance.toString().should.equal("0");
      });

      it("emits a transfer event", async () => {
        eventTester(result, "Transfer", {
          from: deployer,
          to: recieiver,
          value: amount.toString(),
        });
      });
    });

    describe("failure", async () => {
      it("rejects insufficient balance", async () => {
        let invalidAmount;
        invalidAmount = tokens(1000000000);
        await token
          .transferFrom(deployer, recieiver, invalidAmount, { from: exchange })
          .should.be.rejectedWith(EVM_REVERT);
      });

      it("rejects higher than exchange allowance", async () => {
        let invalidAmount;
        invalidAmount = tokens(10000);
        await token
          .transferFrom(deployer, recieiver, invalidAmount, { from: exchange })
          .should.be.rejectedWith(EVM_REVERT);
      });

      it("Rejects invalid recipients", async () => {
        await token
          .transferFrom(deployer, 0x0, amount, { from: exchange })
          .should.be.rejectedWith("invalid address");
      });
    });
  });
});
