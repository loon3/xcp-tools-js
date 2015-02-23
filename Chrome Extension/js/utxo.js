
function ajax(url, data) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            console.log(xhr.responseText);
            
            $("#sendtokenbutton").html("Sent! Refresh to continue...");
            //$("#sendtokenbutton").prop('disabled', true);
            
            xhr.close;
        }
    }
    xhr.open(data ? "POST" : "GET", url, true);
    if (data) xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(data);
}


function sendBTCpush(hextx) {
    url = 'http://blockchain.info/pushtx';
    postdata = 'tx=' + hextx;
    if (url != null && url != "")
    {
        ajax(url, postdata);
    }
}


function sendBTC(add_from, add_to, sendtotal, transfee) {
    
    var source_html = "https://insight.bitpay.com/api/addr/"+add_from+"/utxo";
    
    var total_utxo = new Array();   
    var sendtotal_satoshis = parseFloat(sendtotal) * 100000000;   
    sendtotal_satoshis.toFixed(0);
    
    var mnemonic = $("#newpassphrase").html();
    
    var privkey = getprivkey(add_from, mnemonic);
    
    
    $.getJSON( source_html, function( data ) {
        
        var amountremaining = (parseFloat(sendtotal) + parseFloat(transfee));
        
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
        
        console.log(total_utxo);
        
        if (amountremaining < 0) {
            var satoshi_change = -(amountremaining.toFixed(8) * 100000000).toFixed(0);
        } else {
            var satoshi_change = 0;
        }
        
        console.log(satoshi_change);
        
        var transaction = new bitcore.Transaction();
            
        for (i = 0; i < total_utxo.length; i++) {
            transaction.from(total_utxo[i]);
        }
        
        transaction.to(add_to, sendtotal_satoshis);
            
        if (satoshi_change > 5459) {
            transaction.to(add_from, satoshi_change);
        }
        transaction.sign(privkey);

        var final_trans = transaction.serialize();
        
        console.log(final_trans);
        
        sendBTCpush(final_trans);
    });
       
}

    
