
var FlightSurety = artifacts.require('FlightSuretyApp');

contract('Flight Surety Tests', function (accounts) {

    const owner = accounts[0];
    const firstAirline = accounts[1];
    
    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("First Airline: accounts[1] ", accounts[1])  

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {
    const flightSurety = await FlightSurety.deployed()

    // Get operating status
    let status = await flightSurety.dataContract.isOperational()
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

    const flightSurety = await FlightSurety.deployed()
      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await flightSurety.dataContract.setOperatingStatus(false, { from: firstAirline });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

    const flightSurety = await FlightSurety.deployed()
      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await flightSurety.dataContract.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

    const flightSurety = await FlightSurety.deployed()
      await flightSurety.dataContract.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await flightSurety.setTestingMode();
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await flightSuretyData.dataContract.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    const flightSurety = await FlightSurety.deployed()
    // ARRANGE
    let newAirline = accounts[2];
    let reverted = false;
    // ACT
    try {
        await flightSurety.registerAirline(newAirline, {from: firstAirline});
    }
    catch(e) {
        reverted = true;
    }

    // ASSERT
    assert.equal(reverted, true, "Airline should not be able to register another airline if it hasn't provided funding");

  });
 

});
