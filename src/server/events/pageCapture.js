///////////////////////////////////////////////////////////////////////////////
// PageCapture event module.
///////////////////////////////////////////////////////////////////////////////

module.exports = function(db) {
    return exports = {
        tableName: "PageCaptures",
        tableStructure: {
            'timestamp':        {type: 'INTEGER'},
            'uuid':             {type: 'TEXT'},
            'tabId':            {type: 'INTEGER'},
        },
        createTable: function () {
            db.createTable(this.tableName, this.tableStructure);
        },
        add: function (data) {
            // Parse payload JSON.
            var payload = JSON.parse(data.payload);
            // Insert payload data into DB.
            db.insert(this.tableName, {
                timestamp: data.time,
                uuid: data.uuid,
                tabId: payload.tabId
            });
            console.log(data.uuid, '[+] Page Capture');
        }
    };
};
