"use strict";
const fs = require('fs');
const util = require('util');
const db = require('intervaluecore-1.0-testnet/db.js');
const conf = require('intervaluecore-1.0-testnet/conf.js');
const desktopApp = require('intervaluecore-1.0-testnet/desktop_app.js');
var readline = require('readline');


var appDataDir = desktopApp.getAppDataDir();
var KEYS_FILENAME = appDataDir + '/' + (conf.KEYS_FILENAME || 'keys.json');
var item = {};


  // READ mnemonic

  var readmem = function readKeys(){
    console.log("\n Read mnemonic...........\n");

  	fs.readFile(KEYS_FILENAME, 'utf8', function(err, data){
  		var rl = readline.createInterface({
  			input: process.stdin,
  			output: process.stdout,
  			//terminal: true
  		});

  		if (err){
  			console.log('failed to read keys.conf, you should generate a headless-wallet first!');
  			throw Error('failed to read key.conf: '+err);
  		}
  		else{
  			rl.question("Passphrase: ", function(passphrase){
  				rl.close();
  				if (process.stdout.moveCursor) process.stdout.moveCursor(0, -1);
  				if (process.stdout.clearLine)  process.stdout.clearLine();
  				var keys = JSON.parse(data);
          item.passphrase = passphrase; // add passphrase attrbuite
          item.mnemonic_phrase = keys.mnemonic_phrase;
          item.temp_priv_key = keys.temp_priv_key;
          item.prev_temp_priv_key = keys.prev_temp_priv_key;
          readkeys();
  			});
  		}
  	});
  };



  // READ definition first!!!
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
          item.wallet = row.wallet;
          item.is_change = row.is_change;
          item.address_index = row.address_index;
          item.definition = JSON.parse(row.definition);
          item.creation_date = row.creation_date;
          console.log("\nShow Local wallet info........... >>\n\n"
          + JSON.stringify(item, null, 2));
          process.exit(0);
    });
  };
readmem();
