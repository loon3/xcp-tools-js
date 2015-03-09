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

function xcp_rc4(key, datachunk) {
    
    return bin2hex(rc4(hex2bin(key), hex2bin(datachunk)));
    
}