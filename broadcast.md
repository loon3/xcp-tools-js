Broadcast Transaction Example
-----------------------------

    http://www.blockscan.com/feedinfo?q=11627824

    2a434e5452505254590000001e552161c8403e000000000000000000000d584350454c454354494f4e203100000000000000000000000000000000000000 
    
    2a                  <-- Message Length + 29 = 13 + 29 = 42 (hex to dec)
    
    434e545250525459    <-- CNTRPRTY prefix (hex to bin)
    
    0000001e            <-- ID = 30 (hex to dec)

    552161c8            <-- Timestamp = 1428251080 (hex to dec)

    403e000000000000    <-- Value = 30 (hex to floating pt)
    
    00000000            <-- Fee Fraction Data = 0 (hex to dec)
    
    0d                  <-- Message Length = 13 (hex to dec)

    584350454c454354494f4e203100000000000000000000000000000000000000    <-- Broadcast Message = XCPELECTION 1 (hex to bin)



