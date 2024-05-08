/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { default: Web3 } = require("web3");
let web3 = new Web3("http://localhost:7545");

/* eslint-disable no-undef */
let Token = artifacts.require("Token");
let Exchange = artifacts.require("Exchange");

// eslint-disable-next-line no-undef
module.exports = async function (deployer) {
  const accounts = await web3.eth.getAccounts();
  const feeAccount = accounts[0];
  const feePercent = 10;

  await deployer.deploy(Token);
  await deployer.deploy(Exchange, feeAccount, feePercent);
};
