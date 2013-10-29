///////////////////////////////////////////////////////////////////////////////
// FormData event module.
///////////////////////////////////////////////////////////////////////////////

module.exports = function(db) {
    return exports = {
        tableName: "FormData",
        tableStructure: {
            'timestamp':        {type: 'INTEGER'},
            'uuid':             {type: 'TEXT'},
            'url':              {type: 'TEXT'},
            'action':           {type: 'TEXT'},
            'method':           {type: 'TEXT'},
            'id':               {type: 'TEXT'},
            'data':             {type: 'TEXT'}
        },
        createTable: function () {
            db.createTable(this.tableName, this.tableStructure);
        },
        add: function (data) {
            // Parse payload JSON.
            var formDataArray = JSON.parse(data.payload);
            // Insert payload data into DB.
            formDataArray.forEach(function (formData) {
                db.insert(exports.tableName, {
                    timestamp: data.time,
                    uuid: data.uuid,
                    url: formData.url,
                    action: formData.action,
                    method: formData.method,
                    id: formData.id,
                    data: formData.data
                });
            });
            console.log(data.uuid, '[+] Form Data');
        }
    };
};
