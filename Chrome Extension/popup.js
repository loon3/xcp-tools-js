function setEncryptedTest() {
    
    chrome.storage.local.set(
                    {
                        'encrypted': true
                    }, function () {
                    
                       getStorage();
                    
                    });
    
}
    
    
    
function getStorage()
{
    chrome.storage.local.get(["passphrase", "encrypted"], function (data)
    {
        if ( data.encrypted == false) {
            
            existingPassphrase(data.passphrase);
            
        } else if ( data.encrypted == true) {
            
            $(".hideEncrypted").hide();
            
            $("#pinsplash").show();
            $("#priceBox").hide();
        
        } else {
            newPassphrase();
        }
        //getRate();
    });
}


    


function showBTCtransactions(transactions) {
            
            $("#btcbalance").html("<div style='font-size: 12px;'>You can perform "+transactions.toFixed(0)+" transactions</div><div id='depositBTC' align='center' style='margin: 5px; cursor: pointer; text-decoration: underline; font-size: 11px; color: #999;'>Deposit bitcoin for transaction fees</div>");
        
            //var titletext = data + " satoshis";

            //$("#btcbalbox").prop('title', titletext);       
            $("#btcbalbox").show();
}

function qrdepositDropdown() {
            
            var currentaddr = $("#xcpaddress").html();
            
            $("#btcbalance").html("Deposit bitcoin for transaction fees<div style='margin: 20px 0 10px 0; font-size: 10px; font-weight: bold;'>"+currentaddr+"</div><div id='btcqr' style='margin: 10px auto 20px auto; height: 100px; width: 100px;'></div><div>Cost per transaction is 0.00043230 BTC</div></div>");
                                  
            var qrcode = new QRCode(document.getElementById("btcqr"), {
    			text: currentaddr,
    			width: 100,
    			height: 100,
    			colorDark : "#000000",
    			colorLight : "#ffffff",
    			correctLevel : QRCode.CorrectLevel.H
				});
            
            
            //$("#btcbalbox").prop('title', ""); 
            $("#btcbalbox").show();
}

function getBTCBalance(pubkey) {
    var source_html = "https://blockchain.info/q/addressbalance/"+pubkey;
    
    $.getJSON( source_html, function( data ) { 
        
        var bitcoinparsed = parseFloat(data) / 100000000;
        
        $("#btcbalhide").html(bitcoinparsed);
        
        var transactions = parseFloat(data) / 43230;
        
        if (transactions >= 1) {
        
           showBTCtransactions(transactions);
            
        } else {
            
           qrdepositDropdown(); 
            
        }
        
    });
}

function getPrimaryBalanceXCP(pubkey, currenttoken) {
    var source_html = "http://xcp.blockscan.com/api2?module=address&action=balance&btc_address="+pubkey+"&asset="+currenttoken;
    
    $.getJSON( source_html, function( data ) {       

       // $.each(data.data, function(i, item) {
            var assetname = data.data[0].asset;   
        //    if (assetname == currenttoken){                
                var assetbalance = data.data[0].balance;   
                $("#xcpbalance").html(assetbalance + "<br><div style='font-size: 22px; font-weight: bold;'>" + currenttoken + "</div>");
                getRate(assetbalance, pubkey, currenttoken);
                     
        //    }
      //  });
                    
    });
    
    if (typeof assetbalance === 'undefined') {
            $("#xcpbalance").html("0<br><div style='font-size: 22px; font-weight: bold;'>" + currenttoken + "</div>");
            getRate(0, pubkey, currenttoken);
    }
}

function getPrimaryBalanceBTC(pubkey){
    var source_html = "https://blockchain.info/q/addressbalance/"+pubkey;
    
    $.getJSON( source_html, function( data ) { 
        
        var bitcoinparsed = parseFloat(data) / 100000000;
        
        $("#xcpbalance").html(bitcoinparsed + "<br><div style='font-size: 22px; font-weight: bold;'>BTC</div>");
        
        getRate(bitcoinparsed, pubkey, "BTC");
        
        
    });
}

function getPrimaryBalance(pubkey){
    
    var currenttoken = $("#currenttoken").html();
   
    if (currenttoken != "BTC") {
        
        getPrimaryBalanceXCP(pubkey, currenttoken);
        
    } else {
    
        getPrimaryBalanceBTC(pubkey);
    
    }
        
}


function getRate(assetbalance, pubkey, currenttoken){
    
    if ($("#ltbPrice").html() == "...") {
    
    $.getJSON( "http://joelooney.org/ltbcoin/ltb.php", function( data ) {
  
        var ltbprice = 1 / parseFloat(data.usd_ltb);     
        
        $("#ltbPrice").html(ltbprice.toFixed(0));
        
            
        if (currenttoken == "LTBCOIN") {
            var usdValue = parseFloat(data.usd_ltb) * parseFloat(assetbalance);
        
            $("#xcpfiatValue").html(usdValue.toFixed(2)); 
            $("#switchtoxcp").hide();
            $("#fiatvaluebox").show();
        } else {
            $("#fiatvaluebox").hide();
            $("#switchtoxcp").show();
        }
        
        
    });
    
    } else {
        
        if (currenttoken == "LTBCOIN") {
            var ltbrate = $("#ltbPrice").html();
            var usdrate = 1 / parseFloat(ltbrate);
            var usdValue = usdrate * parseFloat(assetbalance);
            $("#xcpfiatValue").html(usdValue.toFixed(2));
            $("#switchtoxcp").hide();
            $("#fiatvaluebox").show();
        } else if (currenttoken == "BTC") {
            
            //var btcrate = $("#btcPrice").html();
            //var usdValue = btcrate * parseFloat(assetbalance);
            //$("#xcpfiatValue").html(usdValue.toFixed(2));
            
            $("#fiatvaluebox").hide();
            $("#switchtoxcp").show();
            
            
        } else {
            $("#fiatvaluebox").hide();
            $("#switchtoxcp").show();
        }        
        
        
        
    }
    
    getBTCBalance(pubkey);
}


function convertPassphrase(m){
    var HDPrivateKey = bitcore.HDPrivateKey.fromSeed(m.toHex(), bitcore.Networks.livenet);
    var derived = HDPrivateKey.derive("m/0'/0/" + 0);
    var address1 = new bitcore.Address(derived.publicKey, bitcore.Networks.livenet);
    var pubkey = address1.toString();    
    
    $("#xcpaddressTitle").show();
    $("#xcpaddress").html(pubkey);
    
    getPrimaryBalance(pubkey);
    
}

function assetDropdown(m)
{
    $(".addressselect").html("");
    
    var HDPrivateKey = bitcore.HDPrivateKey.fromSeed(m.toHex(), bitcore.Networks.livenet);
                
                 
    for (var i = 0; i < 5; i++) {
                            
        var derived = HDPrivateKey.derive("m/0'/0/" + i);
        var address1 = new bitcore.Address(derived.publicKey, bitcore.Networks.livenet);
                           
        var pubkey = address1.toString();
                            
        //$(".addressselect").append("<option label='"+pubkey.slice(0,8)+"...'>"+pubkey+"</option>");
        
        $(".addressselect").append("<option label='"+pubkey+"'>"+pubkey+"</option>");
    }
}

function newPassphrase()
{
    
    
    m = new Mnemonic(128);
    m.toWords();
    var str = m.toWords().toString();
    var res = str.replace(/,/gi, " ");
    var phraseList = res; 
    
    $("#newpassphrase").html(phraseList);
    
    chrome.storage.local.set(
                    {
                        'passphrase': phraseList,
                        'encrypted': false
                    }, function () {
                        
                        $(".hideEncrypted").show();
                        convertPassphrase(m);
                        assetDropdown(m);
                        $('#allTabs a:first').tab('show');
                    
                    });

   
}

function existingPassphrase(string) {
    
    string = string.replace(/\s{2,}/g, ' ');
    var array = string.split(" ");
    m2 = new Mnemonic(array);
    
    $("#newpassphrase").html(string);
       
    
    convertPassphrase(m2);
    assetDropdown(m2);
    
    $('#allTabs a:first').tab('show')
}



function manualPassphrase() {
    var string = $('#manualMnemonic').val().trim().toLowerCase();
    $('#manualMnemonic').val("");
    string = string.replace(/\s{2,}/g, ' ');
    var array = string.split(" ");
    m2 = new Mnemonic(array);
    
    $("#newpassphrase").html(string);
       
    
    
    
    chrome.storage.local.set(
                    {
                        'passphrase': string,
                        'encrypted': false
                    }, function () {
                    
                        convertPassphrase(m2);
                        assetDropdown(m2);
    
                        $(".hideEncrypted").show();
                        $("#manualPassBox").hide();
                        
                        
                         $('#allTabs a:first').tab('show')
                      
                    
                    });
}





function loadAssets(add) {
    
    var source_html = "http://xcp.blockscan.com/api2?module=address&action=balance&btc_address="+add;
    
    $.getJSON( source_html, function( data ) {
        
        var btcbalance = $("#btcbalhide").html();
        
        $( "#allassets" ).html("<div class='btcasset'><div class='assetname'>BTC</div><div class='movetowallet'>Send</div><div class='assetqty'>Balance: "+btcbalance+"</div></div>");

        
        $.each(data.data, function(i, item) {
            var assetname = data.data[i].asset;
            var assetbalance = data.data[i].balance;
    
            var assethtml = "<div class='singleasset'><div class='assetname'>"+assetname+"</div><div class='movetowallet'>Send</div><div class='assetqty'>Balance: "+assetbalance+"</div></div>";
    
            $( "#allassets" ).append( assethtml );

        });
             
    });
}

/*function updateBTC(pubkey){

    var source_html = "https://blockchain.info/q/addressbalance/"+pubkey;
    
    $.getJSON( source_html, function( data ) { 
        $("#xcpbalance").html(data);
    });
};*/




    		function makedSignedMessage(msg, addr, sig)
    		{
        		var qtHdr = [
      			"<pre>-----BEGIN BITCOIN SIGNED MESSAGE-----",
      			"-----BEGIN BITCOIN SIGNATURE-----",
      			"-----END BITCOIN SIGNATURE-----</pre>"
    			];
                
                return qtHdr[0]+'\n'+msg +'\n'+qtHdr[1]+'\nVersion: Bitcoin-qt (1.0)\nAddress: '+addr+'\n\n'+sig+'\n'+qtHdr[2];
    		}
    		
    		function getprivkey(inputaddr, inputpassphrase){
    			//var inputaddr = $('#inputaddress').val();
    			
    			//var string = inputpassphrase.val().trim().toLowerCase();
                //string = string.replace(/\s{2,}/g, ' ');
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
    		
    		
    		
    		function signwith(privkey, pubkey, message) {
    			
    			
    			
    			//var message = "Message, message";
      			var p = updateAddr(privkey, pubkey);
      			
      			if ( !message || !p.address ){
        		return;
      			}

      			message = fullTrim(message);

      			
        		var sig = sign_message(p.key, message, p.compressed, p.addrtype);
   

      			sgData = {"message":message, "address":p.address, "signature":sig};

      			signature_final = makedSignedMessage(sgData.message, sgData.address, sgData.signature);
    			
    			return signature_final;
    
    		}



 