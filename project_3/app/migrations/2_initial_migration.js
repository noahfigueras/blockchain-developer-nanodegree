const FisherMan = artifacts.require("./FisherMan.sol");
const RestaurantOwner = artifacts.require("./RestaurantOwner.sol");
const SupplyChain = artifacts.require("./SupplyChain.sol");

module.exports = function(deployer) {
  deployer.deploy(FisherMan);
  deployer.deploy(RestaurantOwner);
  deployer.deploy(SupplyChain);
};
