// Import modules.
var express    = require('express')
  , app        = express()
  , server     = require('http').createServer(app)
  , sio        = require('socket.io')
  , io         = sio.listen(server)
  , db         = require('sqlite-wrapper')('activity.db')
  ;

// Start server.
// server.listen(8080);

// Create tables.
db.createTable('Fingerprints', {
    'timestamp':        {type: 'INTEGER'},
    'uuid':             {type: 'TEXT'},
    'ipAddress':        {type: 'TEXT'},
    'userAgent':        {type: 'TEXT'},
    'screenResolution': {type: 'TEXT'}
});

db.insertAll('Fingerprints', [
    { timestamp: 123, uuid: 'sadf', ipAddress: '127.0.0.1', userAgent: 'asdfadf', screenResolution: '123x213x21' },
    { timestamp: 124, uuid: 'sadf', ipAddress: '127.0.0.1', userAgent: 'asdfadf', screenResolution: '123x213x21' }
]);

console.log('test');