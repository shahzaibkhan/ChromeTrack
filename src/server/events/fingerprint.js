///////////////////////////////////////////////////////////////////////////////
// Fingerprint event module.
///////////////////////////////////////////////////////////////////////////////

module.exports = function(db) {
    return {
        tableName: "Fingerprints",
        tableStructure: {
            'timestamp':        {type: 'INTEGER'},
            'uuid':             {type: 'TEXT'},
            'ipAddress':        {type: 'TEXT'},
            'userAgent':        {type: 'TEXT'},
            'screenResolution': {type: 'TEXT'}
        },
        createTable: function () {
            db.createTable(this.tableName, this.tableStructure);
        },
        add: function (data, ipAddress) {
            var payload = JSON.parse(data.payload);
            db.insert(this.tableName, {
                timestamp: data.time,
                uuid: data.uuid,
                ipAddress: ipAddress,
                userAgent: payload.userAgent,
                screenResolution: payload.screenResolution
            });
            console.log(data.uuid, '[+] Fingerprint');
        }
    };
};
