function hex2bin(hex) {

        var bytes = [];
        var str;
        
        for (var i = 0; i < hex.length - 1; i += 2) {

                var ch = parseInt(hex.substr(i, 2), 16);
                bytes.push(ch);

        }

        str = String.fromCharCode.apply(String, bytes);
        return str;
    
};

function bin2hex(s) {

        // http://kevin.vanzonneveld.net

        var i, l, o = "",
                n;

        s += "";

        for (i = 0, l = s.length; i < l; i++) {
                n = s.charCodeAt(i).toString(16);
                o += n.length < 2 ? "0" + n : n;
        }

        return o;
    
}; 