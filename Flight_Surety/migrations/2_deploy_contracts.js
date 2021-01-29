const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");

module.exports = function(deployer, networks, accounts) {
    deployer.deploy(FlightSuretyData, accounts[5])
    .then(() => {
        return deployer.deploy(FlightSuretyApp, FlightSuretyData.address)
    });
};
