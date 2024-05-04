/* eslint-disable no-undef */
let Migrations = artifacts.require("../src/contracts/Migrations.sol");

// eslint-disable-next-line no-undef
module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
