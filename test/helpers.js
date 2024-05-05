// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const web3 = require("web3");

const exportObj = {};

exportObj.tokens = (num) => {
  return web3.utils.toBigInt(web3.utils.toWei(num.toString(), "ether"));
};

exportObj.EVM_REVERT = "VM Exception while processing transaction: revert";

// eslint-disable-next-line no-undef
module.exports = exportObj;
