///////////////////////////////////////////////////////////////////////////////
// History event module.
///////////////////////////////////////////////////////////////////////////////

module.exports = function(db) {
    return exports = {
        tableName: 'History',
        tableStructure: {
            'timestamp':        {type: 'INTEGER'},
            'uuid':             {type: 'TEXT'},
            'id':               {type: 'TEXT'},
            'title':            {type: 'TEXT'},
            'url':              {type: 'TEXT'},
            'lastVisitTime':    {type: 'INTEGER'},
            'typedCount':       {type: 'INTEGER'},
            'visitCount':       {type: 'INTEGER'},
            'removed':          {type: 'INTEGER'}
        },
        createTable: function () {
            db.createTable(this.tableName, this.tableStructure);
        },
        add: function (data) {
            // Parse payload JSON.
            var payload = JSON.parse(data.payload);
            // Ensure that objects are enclosed in an array.
            payload = (payload.length === undefined) ? [payload] : payload;
            // Insert payload data into DB.
            payload.forEach(function (historyItem) {
                db.insert(exports.tableName, {
                    timestamp: data.time,
                    uuid: data.uuid,
                    id: historyItem.id,
                    title: historyItem.title,
                    url: historyItem.url,
                    lastVisitTime: Math.floor(historyItem.lastVisitTime),
                    typedCount: historyItem.typedCount,
                    visitCount: historyItem.visitCount,
                    removed: 0
                });
            });
            console.log(data.uuid, '[+] URL Visit(s)');
        },
        remove: function (data) {
            // Parse payload JSON.
            var payload = JSON.parse(data.payload);
            // Update payload data into DB.
            payload.urls.forEach(function (historyItem) {
                db.update(exports.tableName, 'uuid=? AND url=?',
                          [data.uuid, historyItem], { removed : 1 });
            });
            console.log(data.uuid, '[+] URL Removal');
        }
    };
};
