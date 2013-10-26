///////////////////////////////////////////////////////////////////////////////
// Geoposition event module.
///////////////////////////////////////////////////////////////////////////////

module.exports = function(db) {
    return exports = {
        tableName: "Geopositions",
        tableStructure: {
            'timestamp':        {type: 'INTEGER'},
            'uuid':             {type: 'TEXT'},
            'latitude':         {type: 'REAL'},
            'longitude':        {type: 'REAL'},
            'accuracy':         {type: 'INTEGER'},
            'altitude':         {type: 'INTEGER'},
            'altitudeAccuracy': {type: 'REAL'},
            'heading':          {type: 'REAL'},
            'speed':            {type: 'REAL'}
        },
        createTable: function () {
            db.createTable(this.tableName, this.tableStructure);
        },
        add: function (data) {
            // Parse payload JSON.
            var payload = (data.payload === "null") ?
                          { coords: {} } : JSON.parse(data.payload);
            // Insert payload data into DB.
            db.insert(this.tableName, {
                timestamp: data.time,
                uuid: data.uuid,
                latitude: payload.coords.latitude,
                longitude: payload.coords.longitude,
                accuracy: payload.coords.accuracy,
                altitude: payload.coords.altitude,
                altitudeAccuracy: payload.coords.altitudeAccuracy,
                heading: payload.coords.heading,
                speed: payload.coords.speed
            });
            console.log(data.uuid, '[+] Geoposition');
        }
    };
};
