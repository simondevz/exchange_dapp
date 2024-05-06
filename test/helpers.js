// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const web3 = require("web3");

const exportObj = {};

exportObj.ether = (num) => {
  return web3.utils.toBigInt(web3.utils.toWei(num.toString(), "ether"));
};

exportObj.tokens = (num) => exportObj.ether(num);

exportObj.EVM_REVERT = "VM Exception while processing transaction: revert";
exportObj.ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

exportObj.eventTester = (result, eventName, testParams) => {
  const keys = Object.keys(testParams);
  const log = result.logs[0];
  const event = log.args;

  log.event.should.equal(eventName);
  keys.forEach((key) => {
    event[key].toString().should.equal(testParams[key], key + " is correct");
  });
};

// eslint-disable-next-line no-undef
module.exports = exportObj;
