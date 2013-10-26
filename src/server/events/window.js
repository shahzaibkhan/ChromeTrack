///////////////////////////////////////////////////////////////////////////////
// Cookie event module.
///////////////////////////////////////////////////////////////////////////////

module.exports = function(db) {
    return exports = {
        tableName: 'Windows',
        tableStructure: {
            'timestamp':        {type: 'INTEGER'},
            'uuid':             {type: 'TEXT'},
            'id':               {type: 'INTEGER'},
            'focused':          {type: 'INTEGER'},
            'top':              {type: 'INTEGER'},
            'left':             {type: 'INTEGER'},
            'width':            {type: 'INTEGER'},
            'height':           {type: 'INTEGER'},
            'incognito':        {type: 'INTEGER'},
            'type':             {type: 'TEXT'},
            'state':            {type: 'TEXT'},
            'alwaysOnTop':      {type: 'INTEGER'}
        },
        createTable: function () {
            db.createTable(this.tableName, this.tableStructure);
        },
        add: function (data) {
            // Parse payload JSON.
            var payload = JSON.parse(data.payload);
            // Ensure that objects are in an array.
            payload = (payload.length === undefined) ? [payload] : payload;
            // Insert payload data into DB.
            payload.forEach(function (window) {
                // Check to see if the window already exists in DB.
                db.select(exports.tableName, null, null, 'uuid=? AND id=?',
                    [data.uuid, window.id], function (err, rows) {
                    // Add window if it doesn't exist.
                    if (!rows.length) {
                        db.insert(exports.tableName, {
                            timestamp: data.time,
                            uuid: data.uuid,
                            id: window.id,
                            focused: window.focused ? 1 : 0,
                            top: window.top,
                            left: window.left,
                            width: window.width,
                            height: window.height,
                            incognito: window.incognito ? 1 : 0,
                            type: window.type,
                            state: window.state,
                            alwaysOnTop: window.alwaysOnTop ? 1 : 0
                        });
                    }
                });
            });
            console.log(data.uuid, '[+] Window(s)');
        },
        focus: function (data) {
            // Parse payload JSON.
            var payload = JSON.parse(data.payload);
            // Defocus all of the user's windows in DB.
            db.update(this.tableName, 'uuid=?', [data.uuid], { focused : 0 });
            // Focus the specified user's window in DB.
            db.update(this.tableName, 'uuid=? AND id=?',
                      [data.uuid, payload.windowId], { focused : 1 });
            console.log(data.uuid, '[+] Focus Window');
        },
        remove: function (data) {
            // Parse payload JSON.
            var payload = JSON.parse(data.payload);
            // Remove window from DB.
            db.remove(this.tableName, 'uuid=? AND id=?',
                      [data.uuid, payload.windowId]);
            console.log(data.uuid, '[+] Remove Window');
        }
    };
};
