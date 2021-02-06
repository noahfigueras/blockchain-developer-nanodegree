import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.flights = new Map();
        this.initialize(callback);
    }

    async initialize(callback) {
        let accts = await this.web3.eth.getAccounts();
           
        this.owner = accts[0];
        this.passangers = accts[0];

        const flights = ['BP209', 'AM560', 'LM324', 'MB098'];

        let firstAirline = accts[5];
        let airlinesAddress = accts.slice(1,10);

        //Fund First Airline 
        try {
            await this.flightSuretyData.methods.fund(firstAirline)
                .send({
                    from: firstAirline,
                    value: this.web3.utils.toWei('10', 'ether'),
                    gas: 1500000
                });
            console.log(`First Airline ${firstAirline} funded correctly`);
        } catch(e) {
            console.log(e);
            console.log(`Error funding Airline: ${firstAirline}`);
        }

        //Register Airlines
        for(let i = 0; i < 3; i++) {
            try {
                await this.flightSuretyApp.methods.registerAirline(airlinesAddress[i]).send({from: firstAirline});
                console.log(`Airline ${airlinesAddress[i]}, registered successfully by: ${firstAirline}`);
            } catch (e) {
                console.log(e)
                console.log(`Error registering Airline with address: ${airlinesAddress[i]}`)
            }
        }

        //Register Flights for FirstAirline
        for(let i=0; i < flights.length; i++){
            try {
                let departure = Math.floor(new Date(2019, 3, 1, 22, 30, 0, 0) / 1000);
                await this.flightSuretyApp.methods.registerFlight(departure,flights[i]);
                this.flights.set(flights[i], {
                    airlineAddress: firstAirline,
                    name: flights[i],
                    departure: departure,
                });
                console.log('Initial Flights successfully registered for firstAirline.');
            } catch(e) {
                console.log(e);
                console.log('Error Initi First Airline Flights.');
            }
        }
        callback();
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyData.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        console.log(self.flights)
        let obj = self.flights.get(flight)
        let payload = {
            airline: obj.airlineAddress,
            flight: obj.name,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}
