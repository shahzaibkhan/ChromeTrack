// Import modules.
var express    = require('express')
  , app        = express()
  , server     = require('http').createServer(app)
  , sio        = require('socket.io')
  , io         = sio.listen(server)
  , db         = require('sqlite-wrapper')('activity.db')
  ;

// Start server.
server.listen(8080);

///////////////////////////////////////////////////////////////////////////////
// WebSockets handling.
///////////////////////////////////////////////////////////////////////////////

io.sockets.on('connection', function (socket) {
    socket.on('fingerprint', function (data) {
        uuid = data.uuid;
        time = data.time;
        ipAddress = socket.handshake.address.address;
        payload = JSON.parse(data.payload);
        userAgent = payload.userAgent;
        screenRes = payload.screenResolution;
        addFingerprint(uuid, time, ipAddress, userAgent, screenRes);
        console.log('Added fingerprint for', data.uuid);
    });
});

///////////////////////////////////////////////////////////////////////////////
// Database handling.
///////////////////////////////////////////////////////////////////////////////

// Create tables.
db.createTable('Fingerprints', {
    'timestamp':        {type: 'INTEGER'},
    'uuid':             {type: 'TEXT'},
    'ipAddress':        {type: 'TEXT'},
    'userAgent':        {type: 'TEXT'},
    'screenResolution': {type: 'TEXT'}
});

// Define adding functions.
var addFingerprint = function (uuid, time, ipAddress, userAgent, screenRes) {
    db.insert('Fingerprints', {
        timestamp: time,
        uuid: uuid,
        ipAddress: ipAddress,
        userAgent: userAgent,
        screenResolution: screenRes
    });
};
