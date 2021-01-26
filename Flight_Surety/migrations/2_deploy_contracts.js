const FlightSurety = artifacts.require("FlightSuretyApp");

module.exports = function(deployer, networks, accounts) {
    deployer.deploy(FlightSurety, accounts[1]);
};
