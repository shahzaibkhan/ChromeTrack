///////////////////////////////////////////////////////////////////////////////
// FinancialActivity event module.
///////////////////////////////////////////////////////////////////////////////

module.exports = function(db) {
  return exports = {
    tableName: "FinancialActivity",
    tableStructure: {
      'timestamp':        {type: 'INTEGER'},
      'uuid':             {type: 'TEXT'},
      'institution':      {type: 'TEXT'},
      'account':          {type: 'TEXT'},
      'date':             {type: 'INTEGER', primary: true},
      'description':      {type: 'TEXT',    primary: true},
      'debit':            {type: 'REAL',    primary: true},
      'credit':           {type: 'REAL',    primary: true},
      'balance':          {type: 'REAL',    primary: true}
    },
    createTable: function () {
      db.createTable(this.tableName, this.tableStructure);
    },
    add: function (data) {
      // Parse payload JSON.
      var payload = JSON.parse(data.payload);
      // Insert payload data into DB.
      payload.transactions.forEach(function (transaction) {
        date = transaction.date;
        description = transaction.description;
        debit = (transaction.debit ? transaction.debit : 0);
        credit = (transaction.credit ? transaction.credit : 0);
        balance = transaction.balance;
        db.select(exports.tableName, null, null,
          'date=? AND description=? AND debit=? AND credit=? AND balance=?',
          [date, description, debit, credit, balance],
          function (err, rows) {
            if (rows.length === 0) {
              db.insert(exports.tableName, {
                timestamp: data.time,
                uuid: data.uuid,
                institution: payload.institution,
                account: payload.accountNum,
                date: transaction.date,
                description: transaction.description,
                debit: (transaction.debit ? transaction.debit : 0),
                credit: (transaction.credit ? transaction.credit : 0),
                balance: transaction.balance
              });
            }
          });
      });
      console.log(data.uuid, '[+] Financial Activity');
    }
  };
};
