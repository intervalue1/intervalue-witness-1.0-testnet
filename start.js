"use strict";
require("intervaluecore-1.0-testnet/wallet.js");
const explorer = require('intervalue-explorer/explorer.js');
var db = require('intervaluecore-1.0-testnet/db.js');
const headlessWallet = require('intervalue-headless');
const eventBus = require('intervaluecore-1.0-testnet/event_bus.js');
const validationUtils = require("intervaluecore-1.0-testnet/validation_utils.js");
const conf = require('intervaluecore-1.0-testnet/conf.js');
const constants = require('intervaluecore-1.0-testnet/constants.js');

function initRPC() {
    var rpc = require('json-rpc2');

    var server = rpc.Server.$create({
        'websocket': true, // is true by default
        'headers': { // allow custom headers is empty by default
            'Access-Control-Allow-Origin': '*'
        }
    });

    /**
     * Send funds to address.
     * If address is invalid, then returns "invalid address".
     * @param {String} address
     * @param {Integer} amount
     * @return {String} status
     */
    server.expose('sendtoaddress', function(args, opt, cb) {
        var amount = args[1];
        var toAddress = args[0];
        if (amount && toAddress) {
            if (validationUtils.isValidAddress(toAddress))
                headlessWallet.issueChangeAddressAndSendPayment(null, amount, toAddress, null, function(err, unit) {
                    cb(err, err ? undefined : unit);
                });
            else
                cb("invalid address");
        }
        else
            cb("wrong parameters");
    });
    server.expose('getbalance', function(args, opt, cb) {
        let start_time = Date.now();
        var address = args[0];
        var asset = args[1];
        if (address) {
            if (validationUtils.isValidAddress(address))
                db.query("SELECT COUNT(*) AS count FROM my_addresses WHERE address = ?", [address], function(rows) {
                    if (rows[0].count)
                        db.query(
                            "SELECT asset, is_stable, SUM(amount) AS balance \n\
                            FROM outputs JOIN units USING(unit) \n\
                            WHERE is_spent=0 AND address=? AND sequence='good' AND asset "+(asset ? "="+db.escape(asset) : "IS NULL")+" \n\
							GROUP BY is_stable", [address],
                            function(rows) {
                                var balance = {};
                                balance[asset || 'base'] = {
                                    stable: 0,
                                    pending: 0
                                };
                                for (var i = 0; i < rows.length; i++) {
                                    var row = rows[i];
                                    balance[asset || 'base'][row.is_stable ? 'stable' : 'pending'] = row.balance;
                                }
                                cb(null, balance);
                            }
                        );
                    else
                        cb("address not found");
                });
            else
                cb("invalid address");
        }
        else
            Wallet.readBalance(wallet_id, function(balances) {
                console.log('getbalance took '+(Date.now()-start_time)+'ms');
                cb(null, balances);
            });
    });

    /**
     * Send blackbytes to address.
     * If address is invalid, then returns "invalid address".
     * @param {String} device
     * @param {String} address
     * @param {Integer} amount
     * @return {String} status
     */
    server.expose('getaddress', function(args, opt, cb) {
        db.query( "SELECT * FROM my_addresses",
            function(rows) {

                cb(null, rows[0].address);
            });
    });

    server.expose('sendblackbytestoaddress', function(args, opt, cb) {
        if (args.length != 3) {
            return cb("wrong parameters");
        }

        let device = args[0];
        let toAddress = args[1];
        let amount = args[2];

        if (!validationUtils.isValidDeviceAddress(device)) {
            return cb("invalid device address");
        }

        if (!validationUtils.isValidAddress(toAddress)) {
            return cb("invalid address");
        }

        headlessWallet.readSingleAddress(function(fromAddress) {
            createIndivisibleAssetPayment(constants.BLACKBYTES_ASSET, amount, fromAddress, toAddress, device, function(err, unit) {
                cb(err, err ? undefined : unit);
            });
        });
    });

    server.listen(conf.rpcPort, conf.rpcInterface);
}

function createIndivisibleAssetPayment(asset, amount, fromAddress, toAddress, toDevice, callback) {
    var network = require('intervaluecore-1.0-testnet/network.js');
    var indivisibleAsset = require('intervaluecore-1.0-testnet/indivisible_asset.js');
    var walletGeneral = require('intervaluecore-1.0-testnet/wallet_general.js');

    indivisibleAsset.composeAndSaveIndivisibleAssetPaymentJoint({
        asset: asset,
        paying_addresses: [fromAddress],
        fee_paying_addresses: [fromAddress],
        change_address: fromAddress,
        to_address: toAddress,
        amount: amount,
        tolerance_plus: 0,
        tolerance_minus: 0,
        signer: headlessWallet.signer,
        callbacks: {
            ifNotEnoughFunds: callback,
            ifError: callback,
            ifOk: function(objJoint, arrChains) {
                network.broadcastJoint(objJoint);
                if (arrChains) { // if the asset is private
                    walletGeneral.sendPrivatePayments(toDevice, arrChains);
                }
                callback(null, objJoint.unit.unit);
            }
        }
    });
}

function postTimestamp(address) {
    var composer = require('intervaluecore-1.0-testnet/composer.js');
    var network = require('intervaluecore-1.0-testnet/network.js');
    var callbacks = composer.getSavingCallbacks({
        ifNotEnoughFunds: function(err) {
            console.error(err);
        },
        ifError: function(err) {
            console.error(err);
        },
        ifOk: function(objJoint) {
            network.broadcastJoint(objJoint);
        }
    });

    var datafeed = {
        time: new Date().toString(),
        timestamp: Date.now()
    };
    composer.composeDataFeedJoint(address, datafeed, headlessWallet.signer, callbacks);
}

eventBus.once('headless_wallet_ready', function() {
    initRPC();
    headlessWallet.readSingleAddress(function(address) {
        setInterval(postTimestamp, conf.TIMESTAMPING_INTERVAL, address);
    });
});

eventBus.on('paired', function(from_address) {
    console.log('Sucessfully paired with:' + from_address);
    const device = require('intervaluecore-1.0-testnet/device.js');
    device.sendMessageToDevice(from_address, "text", "Welcome to devnet Witness!");
});

