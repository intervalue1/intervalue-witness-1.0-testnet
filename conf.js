
/*jslint node: true */
"use strict";
exports.deviceName = 'Witness';


exports.bServeAsHub = false;
exports.bLight = false;


exports.WS_PROTOCOL = 'wss://';
exports.hub = 'xxxxxxxxx/cc';

exports.admin_email='witness';
exports.from_email='witness';

//接口的端口
exports.rpcPort = '6613';
//有向无环图接口
exports.webPort = 8081; // dag explorer
exports.bServeAsHub = false;
exports.bLight = false;


exports.permanent_pairing_secret = '0000';

// witness configuration
exports.bSingleAddress = true;
exports.THRESHOLD_DISTANCE = 1;
exports.MIN_AVAILABLE_WITNESSINGS = 100;
exports.TIMESTAMPING_INTERVAL = 60 * 1000; // in milliseconds
exports.KEYS_FILENAME = 'keys.json';
exports.initial_witnesses = [
    'JMYEMO4V2LXUKQ7HKQGO4F4XTOJ3EUXJ',
    'VZHYP535NMILZML74E7WDGGS72K2MHAJ',
    'LPZISUKMG2WAUCMIURKOLDKT6IGP3AQV'
];
console.log('finished witness conf');
