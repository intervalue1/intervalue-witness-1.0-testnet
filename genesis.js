"use strict";
const db = require('intervaluecore-1.0-testnet/db.js');
const headlessWallet = require('intervalue-headless');
const eventBus = require('intervaluecore-1.0-testnet/event_bus.js');
const constants = require('intervaluecore-1.0-testnet/constants.js');

function onError(err) {
    throw Error(err);
}

function createGenesisUnit(witness, onDone) {
    var composer = require('intervaluecore-1.0-testnet/composer.js');
    var network = require('intervaluecore-1.0-testnet/network.js');

    var savingCallbacks = composer.getSavingCallbacks({
        ifNotEnoughFunds: onError,
        ifError: onError,
        ifOk: function(objJoint) {
            network.broadcastJoint(objJoint);
            onDone(objJoint.unit.unit);
        }
    });
//    console.log("witness" + witness);
    composer.setGenesis(true);
    composer.composeJoint({
        witnesses: [
            '2BHAF77HJ6HDHPE4DFQCTSFFGJ2DYCEF',
            '434HSL6WJHS32O4Z3PGBICHFW3FT5QNE',
            'GYSSU5WXZQCC5WPJU2BPO2SU4JPJ7R76',
            'KYMVK7RXARLG66Q7MYGU5WIBGCA65DNF',
            'LNMMSGDYCEWR4DDECQSJ4LDJMPKZGBUX',
'OLZE7SXKY5NIQSTGHC7DYMQLMCY56M7I',
'R3DNY3MPVWGUJJBFPJZMD6LTZZTLNUPR',
'T3M3EOKMFD2O32JYUWTHZ5ZB5MPNYSKF',
'T6L2P6CMNBAXBPOCID7NHXUKNMLWSRZ5',
'UFRF2ORG63WC32QFE7RDTWPKCIGIAOTV',
'VE4XTSA5ESMSZQS2XPKL77MMN2EYEP77',
'YGLKMSDBTJZKUGGJTFCXFDPQWFBJ3IX5'

],
        paying_addresses: [witness],

        outputs: [
            { address:'OLZE7SXKY5NIQSTGHC7DYMQLMCY56M7I', amount: 100000000 },
            { address:'R3DNY3MPVWGUJJBFPJZMD6LTZZTLNUPR', amount: 100000000 },
            { address:'GYSSU5WXZQCC5WPJU2BPO2SU4JPJ7R76', amount: 100000000 },
            { address:'T3M3EOKMFD2O32JYUWTHZ5ZB5MPNYSKF', amount: 100000000 },
            { address:'UFRF2ORG63WC32QFE7RDTWPKCIGIAOTV', amount: 100000000 },
            { address:'VE4XTSA5ESMSZQS2XPKL77MMN2EYEP77', amount: 100000000 },
            { address:'KYMVK7RXARLG66Q7MYGU5WIBGCA65DNF', amount: 100000000 },
            { address:'T6L2P6CMNBAXBPOCID7NHXUKNMLWSRZ5', amount: 100000000 },
            { address:'LNMMSGDYCEWR4DDECQSJ4LDJMPKZGBUX', amount: 100000000 },
            { address:'YGLKMSDBTJZKUGGJTFCXFDPQWFBJ3IX5', amount: 100000000 },
            { address:'434HSL6WJHS32O4Z3PGBICHFW3FT5QNE', amount: 100000000 },
            { address: witness, amount: 0 }, // change output
        ],
        signer: headlessWallet.signer,
 callbacks: {
            ifNotEnoughFunds: onError,
            ifError: onError,
            ifOk: function(objJoint, assocPrivatePayloads, composer_unlock) {
              //console.log("fffffffffff********in****KKKKKKKKKKKKK");
                  constants.GENESIS_UNIT = objJoint.unit.unit;
                savingCallbacks.ifOk(objJoint, assocPrivatePayloads, composer_unlock);
            }
        }
    });

}

function addMyWitness(witness, onDone) {
 console.log("fffffffffff************KKKKKKKKKKKKK");
    db.query("INSERT INTO my_witnesses (address) VALUES ('OLZE7SXKY5NIQSTGHC7DYMQLMCY56M7I'),('R3DNY3MPVWGUJJBFPJZMD6LTZZTLNUPR'),('GYSSU5WXZQCC5WPJU2BPO2SU4JPJ7R76'),('T3M3EOKMFD2O32JYUWTHZ5ZB5MPNYSKF'),('UFRF2ORG63WC32QFE7RDTWPKCIGIAOTV'),('VE4XTSA5ESMSZQS2XPKL77MMN2EYEP77'),('KYMVK7RXARLG66Q7MYGU5WIBGCA65DNF'),('T6L2P6CMNBAXBPOCID7NHXUKNMLWSRZ5'),('LNMMSGDYCEWR4DDECQSJ4LDJMPKZGBUX'),('YGLKMSDBTJZKUGGJTFCXFDPQWFBJ3IX5'),('434HSL6WJHS32O4Z3PGBICHFW3FT5QNE')");
    db.query("INSERT INTO my_witnesses (address) VALUES (?)", [witness], onDone);
}

eventBus.once('headless_wallet_ready', function() {
    headlessWallet.readSingleAddress(function(address) {
        createGenesisUnit(address, function(genesisHash) {
            console.log("Genesis created, hash=" + genesisHash);
console.log("fffffffffffKKKKKKKKKKKKK");
            addMyWitness(address, function() {
                process.exit(0);
            });
        });
    });
});