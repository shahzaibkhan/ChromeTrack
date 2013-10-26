///////////////////////////////////////////////////////////////////////////////
// Cookie event module.
///////////////////////////////////////////////////////////////////////////////

module.exports = function(db) {
    return exports = {
        tableName: "Cookies",
        tableStructure: {
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
        },
        createTable: function () {
            db.createTable(this.tableName, this.tableStructure);
        },
        addAll: function (data) {
            // Parse payload JSON.
            var payload = JSON.parse(data.payload);
            // Insert payload data into DB.
            payload.forEach(function (cookie) {
                db.insert(exports.tableName, {
                    timestamp: data.time,
                    uuid: data.uuid,
                    cause: "explicit",
                    name: cookie.name,
                    value: cookie.value,
                    domain: cookie.domain,
                    hostOnly: cookie.hostOnly ? 1 : 0,
                    path: cookie.path,
                    secure: cookie.secure ? 1 : 0,
                    httpOnly: cookie.httpOnly ? 1 : 0,
                    session: cookie.session ? 1 : 0,
                    expirationDate: cookie.expirationDate,
                    storeId: cookie.storeId,
                    removed: 0
                });
            });
            console.log(data.uuid, '[+] All Cookies');
        },
        change: function (data) {
            // Parse payload JSON.
            var payload = JSON.parse(data.payload);
            // Insert payload data into DB.
            db.insert(this.tableName, {
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
            console.log(data.uuid, '[+] Cookie Change');
        }
    };
};
