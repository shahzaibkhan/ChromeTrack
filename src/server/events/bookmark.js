///////////////////////////////////////////////////////////////////////////////
// Cookie event module.
///////////////////////////////////////////////////////////////////////////////

module.exports = function(db) {
    return exports = {
        tableName: 'Bookmarks',
        tableStructure: {
            'timestamp':        {type: 'INTEGER'},
            'uuid':             {type: 'TEXT'},
            'id':               {type: 'TEXT'},
            'parentId':         {type: 'INTEGER'},
            'indexId':          {type: 'INTEGER'},
            'url':              {type: 'TEXT'},
            'title':            {type: 'TEXT'},
            'dateAdded':        {type: 'REAL'},
            'removed':          {type: 'INTEGER'}
        },
        createTable: function () {
            db.createTable(this.tableName, this.tableStructure);
        },
        add: function (data) {
            // Parse payload JSON.
            if (data.payload) {
                var bookmarks = JSON.parse(data.payload);
            } else {
                var bookmarks = data.bookmarks;
            }
            // Insert bookmarks into DB.
            bookmarks.forEach(function (bookmark) {
                // Check to see if the bookmark already exists in DB.
                db.select(exports.tableName, null, null, 'uuid=? AND id=?',
                    [data.uuid, bookmark.id], function (err, rows) {
                    // Add bookmark if it does NOT exist.
                    if (!rows.length) {
                        db.insert(exports.tableName, {
                            timestamp: data.time,
                            uuid: data.uuid,
                            id: bookmark.id,
                            parentId: bookmark.parentId,
                            indexId: bookmark.index,
                            url: bookmark.url,
                            title: bookmark.title,
                            dateAdded: bookmark.dateAdded,
                            removed: 0
                        });
                    // Update bookmark if it does exist.
                    } else {
                        db.update(exports.tableName, 'uuid=? AND id=?',
                            [data.uuid, bookmark.id], {
                            timestamp: data.time,
                            uuid: data.uuid,
                            id: bookmark.id,
                            parentId: bookmark.parentId,
                            indexId: bookmark.index,
                            url: bookmark.url,
                            title: bookmark.title,
                            dateAdded: bookmark.dateAdded
                        });
                    }
                    console.log(data.uuid, '[+] Add Bookmark');
                });
                // Add child bookmarks.
                if (bookmark.children) {
                    if (bookmark.children.length > 0) {
                        exports.add({
                            uuid: data.uuid,
                            time: data.time,
                            bookmarks: bookmark.children
                        });
                    }
                }
            });
        },
        change: function (data) {
            // Parse payload JSON.
            var payload = JSON.parse(data.payload);
            // Change the specified bookmark in DB.
            db.update(this.tableName, 'uuid=? AND id=?',
                      [data.uuid, payload.id], payload.changeInfo);
            console.log(data.uuid, '[+] Change Bookmark');
        },
        remove: function (data) {
            // Parse payload JSON.
            var payload = JSON.parse(data.payload);
            // Set removed flag on the specified bookmark in DB.
            db.update(this.tableName, 'uuid=? AND id=?',
                      [data.uuid, payload.id], { removed : 1 });
            console.log(data.uuid, '[+] Remove Bookmark');
        }
    };
};
