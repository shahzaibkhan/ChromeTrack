///////////////////////////////////////////////////////////////////////////////
// Tab event module.
///////////////////////////////////////////////////////////////////////////////

module.exports = function(db) {
    return exports = {
        tableName: 'Tabs',
        tableStructure: {
            'timestamp':        {type: 'INTEGER'},
            'uuid':             {type: 'TEXT'},
            'id':               {type: 'INTEGER'},
            'indexId':            {type: 'INTEGER'},
            'windowId':         {type: 'INTEGER'},
            'openerTabId':      {type: 'INTEGER'},
            'highlighted':      {type: 'INTEGER'},
            'active':           {type: 'INTEGER'},
            'pinned':           {type: 'INTEGER'},
            'selected':         {type: 'INTEGER'},
            'url':              {type: 'TEXT'},
            'title':            {type: 'TEXT'},
            'favIconUrl':       {type: 'TEXT'},
            'status':           {type: 'TEXT'},
            'incognito':        {type: 'INTEGER'},
            'width':            {type: 'INTEGER'},
            'height':           {type: 'INTEGER'},
            'sessionId':        {type: 'TEXT'},
            'removed':          {type: 'INTEGER'}
        },
        createTable: function () {
            db.createTable(this.tableName, this.tableStructure);
        },
        addAll: function (data) {
            // Parse payload JSON.
            var windows = JSON.parse(data.payload);
            // If input is a list of windows, add all tabs.
            windows.forEach(function (window) {
                window.tabs.forEach(function (tab) {
                    // Add/update tabs.
                    exports._insert(data, tab);
                    console.log(data.uuid, '[+] Create Tab');
                });
            });
        },
        update: function (data) {
            // Parse payload JSON.
            var tab = JSON.parse(data.payload);
            // Update tab in DB.
            exports._insert(data, tab);
            console.log(data.uuid, '[+] Update Tab');
        },
        focus: function (data) {
            // Parse payload JSON.
            var activeInfo = JSON.parse(data.payload);
            console.log(activeInfo);
            // Defocus all tabs for specified window ID.
            db.update(this.tableName, 'uuid=? AND windowId=?',
                      [data.uuid, activeInfo.windowId], { active : 0 });
            // Focus specified tab for specified window ID.
            db.update(this.tableName,
                      'uuid=? AND windowId=? AND id=? AND removed=?',
                      [data.uuid, activeInfo.windowId, activeInfo.tabId, 0],
                      { active : 1 });
            console.log(data.uuid, '[+] Focus Tab');
        },
        remove: function (data) {
            // Parse payload JSON.
            var payload = JSON.parse(data.payload);
            // Remove window from DB.
            db.update(this.tableName, 'uuid=? AND id=?',
                      [data.uuid, payload.tabId], { active: 0, removed : 1 });
            console.log(data.uuid, '[+] Remove Tab');
        },
        _insert: function (data, tab) {
            // Remove all prior tabs with this ID.
            db.update(this.tableName, 'uuid=? AND id=? AND removed=0',
                      [data.uuid, tab.id], { removed : 1 });
            // Insert tab to DB.
            db.insert(exports.tableName, {
                timestamp: data.time,
                uuid: data.uuid,
                id: tab.id,
                indexId: tab.index,
                windowId: tab.windowId,
                openerTabId: tab.openerTabId,
                highlighted: tab.highlighted ? 1 : 0,
                active: tab.active ? 1 : 0,
                pinned: tab.pinned ? 1 : 0,
                selected: tab.selected ? 1 : 0,
                url: tab.url,
                title: tab.title,
                favIconUrl: tab.favIconUrl,
                status: tab.status,
                incognito: tab.incognito ? 1 : 0,
                width: tab.width,
                height: tab.height,
                sessionId: tab.sessionId,
                removed: 0
            });
        },
    };
};
