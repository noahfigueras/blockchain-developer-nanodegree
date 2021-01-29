pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    
    struct Airline {
        bool registered;
        bool funded;
        uint16 numberOfInsurance;
        Votes votes;
    }

    struct Votes{
        uint256 counter;
        mapping(address => bool) voters;
    }

    mapping(address => Airline) private airlines;
    
    uint256 private registeredAirlines;
    uint256 private fundedAirlines;
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/
    
    event AirlineRegistered(address airlineAddress, bool registered);
    event AirlineFunded(address airlineAddress);
    event VoteAdded(address airlineAddress);

    /**
    /* @dev Constructor
    /* The deploying account becomes contractOwner
    **/
   
    constructor (address airlineAddress) public {
        contractOwner = msg.sender;
        //Registering First Airline
        airlines[airlineAddress] = Airline({
            registered: true,
            funded: false,
            numberOfInsurance: 0,
            votes: Votes(0)
        });

        registeredAirlines = registeredAirlines.add(1);
        emit AirlineRegistered(airlineAddress, airlines[airlineAddress].registered);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    **/
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAirlineRegistered(address airlineAddress)
    {
        require(airlines[airlineAddress].registered == true, "Caller is not contract owner");
        _;
    }

    modifier requireAirlineFunded(address airlineAddress)
    {
        require(airlines[airlineAddress].funded == true, "Caller is not contract owner");
        _;
    }
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public
                            view
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address airlineAddress, bool submitToVote) requireIsOperational external {
        //Checking Voting requirements
        if(submitToVote){
            require(airlines[airlineAddress].registered != true,"Airline already registered");
            _updateVotingProcess(airlineAddress, msg.sender);
        } else {
            airlines[airlineAddress].registered = true;
            registeredAirlines = registeredAirlines.add(1);
            emit AirlineRegistered(airlineAddress, airlines[airlineAddress].registered);
        }
    }

   /**
    * @dev Updates the Votes from an airline in order to be registered with 
    *      Multiparty Consensus
    */   
    function _updateVotingProcess(address airlineAddress, address votingAirlineAddress) internal 
    requireAirlineFunded(votingAirlineAddress)
    {
        uint256 min_votes = fundedAirlines.div(2);
        bool airlineVote = airlines[airlineAddress].votes.voters[votingAirlineAddress];
        
        //Add vote
        if(!airlineVote){
            airlines[airlineAddress].votes.voters[votingAirlineAddress] = true;
            airlines[airlineAddress].votes.counter = airlines[airlineAddress].votes.counter.add(1);   
            emit VoteAdded(airlineAddress);
        }
      
        //Register Airline
        require(airlines[airlineAddress].votes.counter >= min_votes,"Airline doesn't have enough votes to be registered");
        airlines[airlineAddress].registered = true;
        emit AirlineRegistered(airlineAddress, airlines[airlineAddress].registered);
    }

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    **/   
    function fund(address airlineAddress) public payable 
    requireAirlineRegistered(airlineAddress) 
    requireIsOperational
    {
        require(msg.sender == airlineAddress, "Airline can't be funded by someone else");
        require(msg.value >= 10 ether, "Not enough ether send");
        if(airlines[airlineAddress].funded != true){
            airlines[airlineAddress].funded = true;
            fundedAirlines = fundedAirlines.add(1);
        }
        emit AirlineFunded(airlineAddress);
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    function airlineFunded(address airlineAddress) public view returns(bool) {
        if(airlines[airlineAddress].funded){
            return true;
        }
        return false;
    }

    function getFundedAirlines() external returns(uint256){
        return fundedAirlines;
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund(msg.sender);
    }


}

