"use strict";
const fs = require('fs');
const util = require('util');
const db = require('intervaluecore/db.js');
const conf = require('intervaluecore/conf.js');
const desktopApp = require('intervaluecore/desktop_app.js');
var readline = require('readline');


var appDataDir = desktopApp.getAppDataDir();
var KEYS_FILENAME = appDataDir + '/' + (conf.KEYS_FILENAME || 'keys.json');
var item = {};

  var readkeys = function(){
    db.query("SELECT * FROM my_addresses", function(rows){

         console.log("\n Read definition...........\n");
         if (rows.length < 1 ) {
           console.log('my_addresses has no entry, you should creat a headless-wallet first!!! ');
     			 process.exit(0);
         }
          // console.log(JSON.stringify(rows[0], null,2));
          var row = rows[0];
          item.address = row.address;
          console.log("\nShow address... >>\n\n"
          + JSON.stringify(item, null, 2));
          process.exit(0);
    });
  };
readkeys();
