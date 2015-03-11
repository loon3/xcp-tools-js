function pad (str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}

function assetid(asset_name) {

    var b26_digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
    var name_array = asset_name.split("");
    
    var n = 0;
    
    for (i = 0; i < name_array.length; i++) { 
        n *= 26;
        n += b26_digits.indexOf(name_array[i]);
    }    
     
    var asset_id = n;
    
    return asset_id;
    
}

function create_xcp_send_data(asset_name, amount) {
    
    var prefix = "1c434e54525052545900000000";
    var trailing_zeros = "000000000000000000000000000000000000000000000000000000000000000000";
    var asset_id = assetid(asset_name); 
    
    var asset_id_hex = pad(asset_id.toString(16), 16);
    var amount_hex = pad((amount*100000000).toString(16), 16)
                               
    var data = prefix + asset_id_hex + amount_hex + trailing_zeros; 
    
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

