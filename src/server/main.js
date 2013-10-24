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
        var payload = JSON.parse(data.payload);
        var uuid = data.uuid;
        var time = data.time;
        var ipAddress = socket.handshake.address.address;
        var userAgent = payload.userAgent;
        var screenRes = payload.screenResolution;
        addFingerprint(uuid, time, ipAddress, userAgent, screenRes);
        console.log('Added fingerprint for:', data.uuid);
    });
    // Get current location (DB: Geopositions).
    socket.on('geoposition', function (data) {
        if (data.payload === "null") {
            var payload = { coords: {} };
        } else {
            var payload = JSON.parse(data.payload);
        }
        var uuid = data.uuid;
        var time = data.time;
        var latitude = payload.coords.latitude;
        var longitude = payload.coords.longitude;
        var accuracy = payload.coords.accuracy;
        var altitude = payload.coords.altitude;
        var altitudeAccuracy = payload.coords.altitudeAccuracy;
        var heading = payload.coords.heading;
        var speed = payload.coords.speed;
        addGeoposition(uuid, time, latitude, longitude, accuracy, altitude,
                       altitudeAccuracy, heading, speed);
        console.log('Added geoposition for:', data.uuid);
    });
    // Get URL visit (DB: History).
    socket.on('url-visit', function (data) {
        var payload = JSON.parse(data.payload);
        var uuid = data.uuid;
        var time = data.time;
        var id = payload.id;
        var title = payload.title;
        var url = payload.url;
        var lastVisitTime = Math.floor(payload.lastVisitTime);
        var typedCount = payload.typedCount;
        var visitCount = payload.visitCount;
        var removed = 0;
        addHistory(uuid, time, id, title, url, lastVisitTime, typedCount,
                   visitCount, removed);
        console.log('Added URL visit for:', data.uuid);
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
var addFingerprint = function (uuid, time, ipAddress, userAgent, screenRes) {
    db.insert('Fingerprints', {
        timestamp: time,
        uuid: uuid,
        ipAddress: ipAddress,
        userAgent: userAgent,
        screenResolution: screenRes
    });
};

var addGeoposition = function (uuid, time, latitude, longitude, accuracy,
                               altitude, altitudeAccuracy, heading, speed) {
    db.insert('Geopositions', {
        timestamp: time,
        uuid: uuid,
        latitude: latitude,
        longitude: longitude,
        accuracy: accuracy,
        altitude: altitude,
        altitudeAccuracy: altitudeAccuracy,
        heading: heading,
        speed: speed
    });
};

var addHistory = function(uuid, time, id, title, url, lastVisitTime,
                          typedCount, visitCount, removed) {
    db.insert('History', {
        timestamp: time,
        uuid: uuid,
        id: id,
        title: title,
        url: url,
        lastVisitTime: lastVisitTime,
        typedCount: typedCount,
        visitCount: visitCount,
        removed: removed
    });
};
