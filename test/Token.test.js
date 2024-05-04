/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const Token = artifacts.require("Token");
chai.use(chaiAsPromised);
chai.should();

contract("Token", ([deployer, recieiver]) => {
  const name = "Simondevz Exchange Token";
  const symbol = "SET";
  const decimal = "18";
  const totalSupply = "1000000000000000000000000";
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
      result.toString().should.equal(totalSupply);
    });

    it("assigns the total supply", async () => {
      const result = await token.balanceOf(deployer);
      result.toString().should.equal(totalSupply);
    });
  });

  describe("sending tokens", () => {
    it("transfers token balances", async () => {
      let balanceOf;
      // before transfer
      balanceOf = await token.balanceOf(deployer);
      console.log("deployer balance before transfer", balanceOf);
      balanceOf = await token.balanceOf(recieiver);
      console.log("deployer balance before transfer", balanceOf);

      // Transfer
      await token.transfer(recieiver, "11000000000000000000", {
        from: deployer,
      });

      // before transfer
      balanceOf = await token.balanceOf(deployer);
      console.log("deployer balance after transfer", balanceOf);
      balanceOf = await token.balanceOf(recieiver);
      console.log("deployer balance after transfer", balanceOf);
    });
  });
});
