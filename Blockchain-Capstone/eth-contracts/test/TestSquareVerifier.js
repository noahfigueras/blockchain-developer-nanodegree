// define a variable to import the <Verifier> or <renamedVerifier> solidity contract generated by Zokrates

// Test verification with correct proof
// - use the contents from proof.json generated from zokrates steps

    
// Test verification with incorrect proof

var Verifier = artifacts.require('./Verifier');
var proof = require('../../zokrates/code/square/proof');
contract('Verifier', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    describe('Verifier test', function () {
        beforeEach(async function () {
            this.contract = await Verifier.new({from: account_one});

        })
        it('Tests verification with correct proof', async function () {
          let A = proof.proof.a;
          let B = proof.proof.b;
          let C = proof.proof.c;
          let input = proof.inputs;
          let check = await this.contract.verifyTx.call(A,B,C,input);
          assert.equal(check,true, 'Error: Your proof is incorrect');
        })

        it('Tests verification with incorrect proof', async function () {
          //let total = await this.contract.totalSupply();
          let A = proof.proof.a;
          let B = proof.proof.b;
          let C = proof.proof.c;
          let input2 = ["0x0000000000000000000000000000000000000000000000000000000000000009","0x0000000000000000000000000000000000000000000000000000000000000009"];
          let check = await this.contract.verifyTx.call(A,B,C,input2);
          assert.equal(check,false, 'Error: Your proof is correct');
        })

    });

})