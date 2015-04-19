function randomIntFromInterval(min,max) {

    return Math.floor(Math.random()*(max-min+1)+min); 
    
}

function pad(str, max) {   
    
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;   
    
}

function padtrail(str, max) {

    while (str.length < max) {
        str += "0";
    }
    return str;
}

function hex_byte() {

    var hex_digits = "0123456789abcdef";
    var hex_dig_array = hex_digits.split('');
    
    var hex_byte_array = new Array();
        
    for (a = 0; a < 16; a++){
        for (b = 0; b < 16; b++){            
            hex_byte_array.push(hex_dig_array[a] + hex_dig_array[b]);           
        }
    }
    
    return hex_byte_array;
   
}

function assetname(assetid) {

    if(assetid != 1){
    
        var b26_digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
        var letter_array = b26_digits.split("");
        var asset_name = "";
        var div;
        var rem;
        
        while (assetid > 0) { 
            
            div = Math.floor(assetid/26);
            rem = assetid % 26;
            
            assetid = div;
            
            asset_name = asset_name + letter_array[rem];
            
        }    
        
        var final_name = asset_name.split("").reverse().join("");
    
    } else {
        
        var final_name = "XCP";
        
    }
    
    return final_name;
    
}

function assetid(asset_name) {
    
    asset_name.toUpperCase();

    if(asset_name != "XCP"){
    
        var b26_digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
        var name_array = asset_name.split("");
    
        var n = 0;
    
        for (i = 0; i < name_array.length; i++) { 
            n *= 26;
            n += b26_digits.indexOf(name_array[i]);
        }    
     
        var asset_id = n;
    
    } else {
        
        var asset_id = 1;
        
    }
    
    return asset_id;
    
}


function create_broadcast_data(message, value, feefraction) {
    
    //max 32 character broadcast for single OP_CHECKMULTISIG output
    //fee fraction must be less than 42.94967295 to be stored as a 4-byte hexadecimal
    
    var feefraction_int = parseFloat(feefraction).toFixed(8) * 100000000;
    feefraction_int = Math.round(feefraction_int);
    
    if (message.length <= 32 && feefraction_int <= 4294967295) {
        
        var currenttime = Math.floor(Date.now() / 1000);
        var currenttime_hex = currenttime.toString(16);   
            
        var cntrprty_prefix = "434e5452505254590000001e"; //includes ID = 30
          
        var messagelength = message.length;
        var messagelength_hex = pad(messagelength.toString(16),2);
        
        var initiallength = parseFloat(messagelength) + 29;
        var initiallength_hex = pad(initiallength.toString(16),2);
         
        var feefraction_hex = pad(feefraction_int.toString(16),8);
       
        var message_hex_short = bin2hex(message);
        var message_hex = padtrail(message_hex_short, 64);
        
        
        var value_binary = toIEEE754Double(parseFloat(value));
    
        var value_hex_array = new Array();
        
        for (i = 0; i < value_binary.length; ++i) {
            value_hex_array[i] = pad(value_binary[i].toString(16),2);
        }

        var value_hex = value_hex_array.join("");

        var broadcast_tx_data = initiallength_hex + cntrprty_prefix + currenttime_hex + value_hex + feefraction_hex + messagelength_hex + message_hex;
        
        return broadcast_tx_data;
    
    } else {
        
        var error = "error";
        return error;
        
    }
    
}



function create_xcp_send_data(asset_name, amount) {
    
    var prefix = "1c434e54525052545900000000"; //CNTRPRTY
    var trailing_zeros = "000000000000000000000000000000000000000000000000000000000000000000";
    var asset_id = assetid(asset_name); 
    
    var asset_id_hex = pad(asset_id.toString(16), 16);
    var amount_hex = pad((amount*100000000).toString(16), 16)
                               
    var data = prefix + asset_id_hex + amount_hex + trailing_zeros; 
    
    return data;
    
}

function create_xcp_send_data_opreturn(asset_name, amount) {
    
    var prefix = "434e54525052545900000000"; //CNTRPRTY
    //var trailing_zeros = "000000000000000000000000000000000000000000000000000000000000000000";
    var asset_id = assetid(asset_name); 
    
    var asset_id_hex = pad(asset_id.toString(16), 16);
    var amount_hex = pad((amount*100000000).toString(16), 16)
                               
    var data = prefix + asset_id_hex + amount_hex; 
    
    return data;
    
}


function xcp_rc4(key, datachunk) {
    
    return bin2hex(rc4(hex2bin(key), hex2bin(datachunk)));
    
}

function address_from_pubkeyhash(pubkeyhash) {
    
    var publicKey = new bitcore.PublicKey(pubkeyhash);
    var address = bitcore.Address.fromPublicKey(publicKey);
    
    //console.log(address.toString());
    return address.toString();
    
}

function addresses_from_datachunk(datachunk) {
    
    var hex_byte_array = hex_byte();
    
    var pubkey_seg1 = datachunk.substring(0, 62);
    var pubkey_seg2 = datachunk.substring(62, 124);
    var first_byte = "02";
    var second_byte;
    var pubkeyhash;
    var address1="";
    var address2="";
    var rand;
    
    while (address1.length == 0) {
        rand = randomIntFromInterval(0,255);
        
        second_byte = hex_byte_array[rand];          
        pubkeyhash = first_byte + pubkey_seg1 + second_byte;
            
        if (bitcore.PublicKey.isValid(pubkeyhash)){
            console.log(pubkeyhash);        
            var hash1 = pubkeyhash;
            var address1 = address_from_pubkeyhash(pubkeyhash);
        }    

    }
    
    while (address2.length == 0) {
        rand = randomIntFromInterval(0,255);
        
        second_byte = hex_byte_array[rand];          
        pubkeyhash = first_byte + pubkey_seg2 + second_byte;
            
        if (bitcore.PublicKey.isValid(pubkeyhash)){
            console.log(pubkeyhash);
            var hash2 = pubkeyhash;
            var address2 = address_from_pubkeyhash(pubkeyhash);
        }  

    }
         
    console.log(address1);
    console.log(address2);
    
    var data_hashes = [hash1, hash2];
    
    return data_hashes;
    
}


 function getprivkey(inputaddr, inputpassphrase){
    

                var array = inputpassphrase.split(" ");
                
                m2 = new Mnemonic(array);
                
                var HDPrivateKey = bitcore.HDPrivateKey.fromSeed(m2.toHex(), bitcore.Networks.livenet);
                
                 
                        for (var i = 0; i < 50; i++) {
                            
                            var derived = HDPrivateKey.derive("m/0'/0/" + i);
                            var address1 = new bitcore.Address(derived.publicKey, bitcore.Networks.livenet);
                           
                            var pubkey = address1.toString();
                            
                            if (inputaddr == pubkey) {
                            var privkey = derived.privateKey.toWIF();
                            break;
                            
                            }
                        }
                
                return privkey;

 }


function sendXCP(add_from, add_to, asset, asset_total, btc_total, msig_total, transfee, mnemonic) {
       
    //var mnemonic = $("#newpassphrase").html();
    
    var privkey = getprivkey(add_from, mnemonic);
     
    var source_html = "https://insight.bitpay.com/api/addr/"+add_from+"/utxo";
    var total_utxo = new Array();   
       
    $.getJSON( source_html, function( data ) {
        
        var amountremaining = (parseFloat(btc_total) + parseFloat(msig_total) + parseFloat(transfee));
        
        data.sort(function(a, b) {
            return b.amount - a.amount;
        });
        
        $.each(data, function(i, item) {
            
             var txid = data[i].txid;
             var vout = data[i].vout;
             var script = data[i].scriptPubKey;
             var amount = parseFloat(data[i].amount);
             
             amountremaining = amountremaining - amount;            
             amountremaining.toFixed(8);
    
             var obj = {
                "txid": txid,
                "address": add_from,
                "vout": vout,
                "scriptPubKey": script,
                "amount": amount
             };
            
             total_utxo.push(obj);
              
             //dust limit = 5460 
            
             if (amountremaining == 0 || amountremaining < -0.00005460) {                                 
                 return false;
             }
             
        });
    
        var utxo_key = total_utxo[0].txid;
        
        if (amountremaining < 0) {
            var satoshi_change = -(amountremaining.toFixed(8) * 100000000).toFixed(0);
        } else {
            var satoshi_change = 0;
        }
    
        var datachunk_unencoded = create_xcp_send_data(asset, asset_total);
        var datachunk_encoded = xcp_rc4(utxo_key, datachunk_unencoded);
        var address_array = addresses_from_datachunk(datachunk_encoded);
        
        var sender_pubkeyhash = new bitcore.PublicKey(bitcore.PrivateKey.fromWIF(privkey));
        
        var scriptstring = "OP_1 33 0x"+address_array[0]+" 33 0x"+address_array[1]+" 33 0x"+sender_pubkeyhash+" OP_3 OP_CHECKMULTISIG";
        console.log(scriptstring);
        var data_script = new bitcore.Script(scriptstring);
        
        var transaction = new bitcore.Transaction();
            
        for (i = 0; i < total_utxo.length; i++) {
            transaction.from(total_utxo[i]);
        }
    
        var btc_total_satoshis = parseFloat((btc_total * 100000000).toFixed(0));
        transaction.to(add_to, btc_total_satoshis);
        
        var msig_total_satoshis = parseFloat((msig_total * 100000000).toFixed(0));
        
        var xcpdata_msig = new bitcore.Transaction.Output({script: data_script, satoshis: msig_total_satoshis}); 
        
        transaction.addOutput(xcpdata_msig);
                  
        if (satoshi_change > 5459) {
            transaction.to(add_from, satoshi_change);
        }
        
        transaction.sign(privkey);

        var final_trans = transaction.serialize();
        
        console.log(final_trans);
        
        $("#raw").html(final_trans);   
        //sendBTCpush(final_trans);  //uncomment to push raw tx to the bitcoin network via blockchain.info

    });
    
}


function sendXCP_opreturn(add_from, add_to, asset, asset_total, btc_total, transfee, mnemonic) {
       
    //var mnemonic = $("#newpassphrase").html();
    
    var privkey = getprivkey(add_from, mnemonic);
     
    var source_html = "https://insight.bitpay.com/api/addr/"+add_from+"/utxo";
    var total_utxo = new Array();   
       
    $.getJSON( source_html, function( data ) {
        
        var amountremaining = (parseFloat(btc_total) + parseFloat(transfee));
        
        console.log(amountremaining);
        
        data.sort(function(a, b) {
            return b.amount - a.amount;
        });
        
        $.each(data, function(i, item) {
            
             var txid = data[i].txid;
             var vout = data[i].vout;
             var script = data[i].scriptPubKey;
             var amount = parseFloat(data[i].amount);
             
             amountremaining = amountremaining - amount;            
             amountremaining.toFixed(8);
    
             var obj = {
                "txid": txid,
                "address": add_from,
                "vout": vout,
                "scriptPubKey": script,
                "amount": amount
             };
            
             total_utxo.push(obj);
              
             //dust limit = 5460 
            
             if (amountremaining == 0 || amountremaining < -0.00005460) {                                 
                 return false;
             }
             
        });
    
        var utxo_key = total_utxo[0].txid;
        
        if (amountremaining < 0) {
            var satoshi_change = -(amountremaining.toFixed(8) * 100000000).toFixed(0);
        } else {
            var satoshi_change = 0;
        }
    
        var datachunk_unencoded = create_xcp_send_data_opreturn(asset, asset_total);
        var datachunk_encoded = xcp_rc4(utxo_key, datachunk_unencoded);
        
        var sender_pubkeyhash = new bitcore.PublicKey(bitcore.PrivateKey.fromWIF(privkey));
        
        var scriptstring = "OP_RETURN 28 0x"+datachunk_encoded;
        var data_script = new bitcore.Script(scriptstring);
        
        var transaction = new bitcore.Transaction();
            
        for (i = 0; i < total_utxo.length; i++) {
            transaction.from(total_utxo[i]);
            
            
        }
        
        console.log(total_utxo);
    
        var btc_total_satoshis = parseFloat((btc_total * 100000000).toFixed(0));
        
        console.log(btc_total_satoshis);
        
        transaction.to(add_to, btc_total_satoshis);
        
        var xcpdata_msig = new bitcore.Transaction.Output({script: data_script, satoshis: 0}); 
       
        transaction.addOutput(xcpdata_msig);
        
        console.log(satoshi_change);
        
        if (satoshi_change > 5459) {
            transaction.change(add_from);
        }
        
        
        
        transaction.sign(privkey);

        var final_trans = transaction.uncheckedSerialize();
        
        console.log(final_trans);
        
        $("#raw").html(final_trans);   
        //sendBTCpush_chainso(final_trans);  //uncomment to push raw tx to the bitcoin network via chain.so (note: blockchain.info does not accept OP_RETURN txs)

    });
    
}


function sendBroadcast(add_from, message, value, feefraction, msig_total, transfee, mnemonic) {
       
    //var mnemonic = $("#newpassphrase").html();
    
    var privkey = getprivkey(add_from, mnemonic);
     
    var source_html = "https://insight.bitpay.com/api/addr/"+add_from+"/utxo";
    var total_utxo = new Array();   
       
    $.getJSON( source_html, function( data ) {
        
        var amountremaining = parseFloat(msig_total) + parseFloat(transfee);
        
        data.sort(function(a, b) {
            return b.amount - a.amount;
        });
        
        $.each(data, function(i, item) {
            
             var txid = data[i].txid;
             var vout = data[i].vout;
             var script = data[i].scriptPubKey;
             var amount = parseFloat(data[i].amount);
             
             amountremaining = amountremaining - amount;            
             amountremaining.toFixed(8);
    
             var obj = {
                "txid": txid,
                "address": add_from,
                "vout": vout,
                "scriptPubKey": script,
                "amount": amount
             };
            
             total_utxo.push(obj);
              
             //dust limit = 5460 
            
             if (amountremaining == 0 || amountremaining < -0.00005460) {                                 
                 return false;
             }
             
        });
    
        var utxo_key = total_utxo[0].txid;
        
        if (amountremaining < 0) {
            var satoshi_change = -(amountremaining.toFixed(8) * 100000000).toFixed(0);
        } else {
            var satoshi_change = 0;
        }
    
        var datachunk_unencoded = create_broadcast_data(message, value, feefraction);
        
        if (datachunk_unencoded != "error") {
        
            var datachunk_encoded = xcp_rc4(utxo_key, datachunk_unencoded);
            var address_array = addresses_from_datachunk(datachunk_encoded);
        
            var sender_pubkeyhash = new bitcore.PublicKey(bitcore.PrivateKey.fromWIF(privkey));
        
            var scriptstring = "OP_1 33 0x"+address_array[0]+" 33 0x"+address_array[1]+" 33 0x"+sender_pubkeyhash+" OP_3 OP_CHECKMULTISIG";
            console.log(scriptstring);
            var data_script = new bitcore.Script(scriptstring);
        
            var transaction = new bitcore.Transaction();
            
            for (i = 0; i < total_utxo.length; i++) {
                transaction.from(total_utxo[i]);
            }
        
            var msig_total_satoshis = parseFloat((msig_total * 100000000).toFixed(0));
        
            var xcpdata_msig = new bitcore.Transaction.Output({script: data_script, satoshis: msig_total_satoshis}); 
        
            transaction.addOutput(xcpdata_msig);
                  
            if (satoshi_change > 5459) {
                transaction.to(add_from, satoshi_change);
            }
        
            transaction.sign(privkey);

            var final_trans = transaction.serialize();
            
        } else {
            
            var final_trans = "error";
            
        }
        
        console.log(final_trans);
        
        $("#raw").html(final_trans);   
        //sendBTCpush(final_trans);  //uncomment to push raw tx to the bitcoin network

    });
    
}




function create_new_assetid() {
         
        var assetid = "A11";
          
        for (var i = 1; i < 19; i++) {
            assetid += randomIntFromInterval(0,9);
        };
        
        return assetid;
    
}

function is_asset_unique(assetid, quantity, divisible, description, callback){
    
    var source_html = "https://counterpartychain.io/api/asset/"+assetid;
    
    $.getJSON( source_html, function( data ) {
        
        console.log(data.success);
        
        if(data.success == 0) { //asset is unique
            
            callback(assetid);
            
        } else { //asset is not unique
            
            //setTimeout(create_asset_unique(quantity, divisible, description, function(){}), 2000);
            
            callback("error");
            
        }
        
    });
    
}


function create_asset_unique(assetid_new, quantity, divisible, description, callback){
    
    if (assetid_new == "A") {
    
        var newasset = create_new_assetid();
        
    } else {
        
        var newasset = assetid_new;
        
    }
    
    is_asset_unique(newasset, quantity, divisible, description, function(assetid_unique){
              
        if (assetid_unique != "error") {
            
            console.log("Unique Asset ID: "+assetid_unique);

            if (assetid_unique.charAt(0) == "A") {
            
                assetid_num = parseInt(assetid_unique.substring(1));
                
            } else {
                
                assetid_num = assetid(assetid_unique);
                
            }

            //var issuance_data = create_issuance_data(assetid_num, 1000, true, "testing 1-2-3");

            var issuance_data = create_issuance_data(assetid_num, quantity, divisible, description);

            console.log(issuance_data);
            console.log(issuance_data.length);

            callback(issuance_data);
            
        } else {
            
            callback("error");
            
        }
        
    });

}




function create_issuance_data(assetid, quantity, divisible, description) {
    
    //max 22 character description for single OP_CHECKMULTISIG output
    //divisible asset quantity must be less than 184467440737.09551615 and non-divisible less than 18446744073709551615 to be stored as an 8-byte hexadecimal
    
    if (divisible == true || divisible == "true") {
        var quantity_int = parseFloat(quantity).toFixed(8) * 100000000;
        var divisible_hex = "01000000000000000000";
    } else {
        var quantity_int = parseFloat(quantity); 
        var divisible_hex = "00000000000000000000";
    }
    
    quantity_int = Math.round(quantity_int);
    
    
    if (description.length <= 22 && quantity_int <= 18446744073709551615) {
            
        var cntrprty_prefix = "434e545250525459"; 
        var trans_id = "00000014";
          
        var descriptionlength = description.length;
        var descriptionlength_hex = pad(descriptionlength.toString(16),2);
        
        var initiallength = parseFloat(descriptionlength) + 39;
        var initiallength_hex = pad(initiallength.toString(16),2);
         
        var assetid_hex = pad(assetid.toString(16),16);
        
        var quantity_hex = pad(quantity_int.toString(16),16);
       
        var description_hex_short = bin2hex(description);
        var description_hex = padtrail(description_hex_short, 44);

        var issuance_tx_data = initiallength_hex + cntrprty_prefix + trans_id + assetid_hex + quantity_hex + divisible_hex + descriptionlength_hex + description_hex;
        
        return issuance_tx_data;
    
    } else {
        
        var error = "error";
        return error;
        
    }
    
}



function createIssuance(add_from, assetid, quantity, divisible, description, msig_total, transfee, mnemonic) {
       
    //var mnemonic = $("#newpassphrase").html();
    
    var privkey = getprivkey(add_from, mnemonic);
     
    var source_html = "https://insight.bitpay.com/api/addr/"+add_from+"/utxo";
    var total_utxo = new Array();   
       
    $.getJSON( source_html, function( data ) {
        
        var amountremaining = parseFloat(msig_total) + parseFloat(transfee);
        
        data.sort(function(a, b) {
            return b.amount - a.amount;
        });
        
        $.each(data, function(i, item) {
            
             var txid = data[i].txid;
             var vout = data[i].vout;
             var script = data[i].scriptPubKey;
             var amount = parseFloat(data[i].amount);
             
             amountremaining = amountremaining - amount;            
             amountremaining.toFixed(8);
    
             var obj = {
                "txid": txid,
                "address": add_from,
                "vout": vout,
                "scriptPubKey": script,
                "amount": amount
             };
            
             total_utxo.push(obj);
              
             //dust limit = 5460 
            
             if (amountremaining == 0 || amountremaining < -0.00005460) {                                 
                 return false;
             }
             
        });
    
        var utxo_key = total_utxo[0].txid;
        
        if (amountremaining < 0) {
            var satoshi_change = -(amountremaining.toFixed(8) * 100000000).toFixed(0);
        } else {
            var satoshi_change = 0;
        }
    
        create_asset_unique(assetid, quantity, divisible, description, function(datachunk_unencoded){
        
            if (datachunk_unencoded != "error") {
        
                var datachunk_encoded = xcp_rc4(utxo_key, datachunk_unencoded);
                var address_array = addresses_from_datachunk(datachunk_encoded);

                var sender_pubkeyhash = new bitcore.PublicKey(bitcore.PrivateKey.fromWIF(privkey));

                var scriptstring = "OP_1 33 0x"+address_array[0]+" 33 0x"+address_array[1]+" 33 0x"+sender_pubkeyhash+" OP_3 OP_CHECKMULTISIG";
                console.log(scriptstring);
                var data_script = new bitcore.Script(scriptstring);

                var transaction = new bitcore.Transaction();

                for (i = 0; i < total_utxo.length; i++) {
                    transaction.from(total_utxo[i]);
                }

                var msig_total_satoshis = parseFloat((msig_total * 100000000).toFixed(0));

                var xcpdata_msig = new bitcore.Transaction.Output({script: data_script, satoshis: msig_total_satoshis}); 

                transaction.addOutput(xcpdata_msig);

                if (satoshi_change > 5459) {
                    transaction.to(add_from, satoshi_change);
                }

                transaction.sign(privkey);

                var final_trans = transaction.serialize();

            } else {

                var final_trans = "error";

            }

            console.log(final_trans);
        
            $("#raw").html(final_trans);   
        //sendBTCpush(final_trans);  //uncomment to push raw tx to the bitcoin network
            
        });

    });
    
}