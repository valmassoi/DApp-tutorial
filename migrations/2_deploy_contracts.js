var ConvertLib = artifacts.require("./ConvertLib.sol");
var Conference = artifacts.require("./Conference.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, Conference);
  deployer.deploy(Conference);
};
