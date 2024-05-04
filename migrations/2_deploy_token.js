/* eslint-disable no-undef */
let Token = artifacts.require("Token");

// eslint-disable-next-line no-undef
module.exports = function (deployer) {
  deployer.deploy(Token);
};
