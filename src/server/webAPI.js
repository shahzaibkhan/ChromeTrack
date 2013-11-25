///////////////////////////////////////////////////////////////////////////////
// REST API module.
///////////////////////////////////////////////////////////////////////////////

module.exports = function (app, db) {
  // Return a list of all API routes.
  app.get('/api', function (req, res) {
    var response = {
      'routes': {
        'get': [],
        'post': []
      }
    };
    // Add all GET routes.
    if ('get' in app.routes) {
      app.routes['get'].forEach(function (route) {
        if (route.path.lastIndexOf('/api/', 0) === 0) {
          response.routes.get.push(route.path);
        }
      });
    }
    // Add all POST routes.
    if ('post' in app.routes) {
      app.routes['post'].forEach(function (route) {
        if (route.path.lastIndexOf('/api/', 0) === 0) {
          response.routes.get.push(route.path);
        }
      });
    }
    res.json(response);
  });

  // Return all UUIDs in reverse chronological order.
  app.get('/api/users', function(req, res) {
    var response = { 'users': [] };
    db.selectQuery(
      'SELECT max(timestamp), uuid FROM Fingerprints ' +
      'GROUP BY uuid ORDER BY timestamp DESC', null,
      function (err, rows) {
        rows.forEach(function (row) {
          var user = {
            'uuid': row['uuid'],
            'lastSeen': row['max(timestamp)']
          };
          response.users.push(user);
        });
        res.json(response);
      });
  });

  // Return geopositions by UUID in reverse chronological order.
  app.get('/api/geopositions/:uuid', function(req, res) {
    uuid = req.params.uuid;
    whereClause = 'uuid=? AND accuracy IS NOT NULL';
    whereValues = [uuid];
    // Filter by date range.
    if (req.query.fromDate > 0) {
      whereClause += ' AND timestamp >= ?';
      whereValues.push(req.query.fromDate);
    }
    if (req.query.toDate > 0) {
      whereClause += ' AND timestamp <= ?';
      whereValues.push(req.query.toDate);
    }
    // Impose limit.
    var limit;
    if (req.query.limit > 0) {
      limit = req.query.limit;
    } else {
      limit = null;
    }
    // Query db.
    db.select('Geopositions', null, null, whereClause, whereValues,
      function (err, rows) {
        var response = {
          'uuid': uuid,
          'total': rows.length,
          'geopositions': []
        };
        rows.forEach(function (row) {
          delete row.uuid;
          response.geopositions.push(row);
        });
        // Send response.
        res.json(response);
      }, 'timestamp DESC', limit);
  });

  // Return bookmarks by UUID in reverse chronological order.
  app.get('/api/bookmarks/:uuid', function(req, res) {
    uuid = req.params.uuid;
    whereClause = 'uuid=?';
    whereValues = [uuid];
    // Filter by keywords in url and title columns.
    if (req.query.contains) {
      searchStrings = req.query.contains.split(' ');
      searchStrings.forEach(function (searchString) {
        whereClause += " AND (url || title) LIKE '%' || ? || '%'";
        whereValues.push(searchString);
      });
    }
    db.select('Bookmarks', null, null, whereClause, whereValues,
      function (err, rows) {
        var response = { 'uuid': uuid, 'bookmarks': [] };
        rows.forEach(function (row) {
          delete row.uuid;
          delete row.timestamp;
          response.bookmarks.push(row);
        });
        res.json(response);
      }, 'dateAdded DESC');
  });

  // Return history by UUID in reverse chronological order.
  app.get('/api/history/:uuid', function(req, res) {
    uuid = req.params.uuid;
    whereClause = 'uuid=?';
    whereValues = [uuid];
    // Filter by date range.
    if (req.query.fromDate > 0) {
      whereClause += ' AND timestamp >= ?';
      whereValues.push(req.query.fromDate);
    }
    if (req.query.toDate > 0) {
      whereClause += ' AND timestamp <= ?';
      whereValues.push(req.query.toDate);
    }
    // Filter by keywords in url and title columns.
    if (req.query.contains) {
      searchStrings = req.query.contains.split(' ');
      searchStrings.forEach(function (searchString) {
        whereClause += " AND (url || title) LIKE '%' || ? || '%'";
        whereValues.push(searchString);
      });
    }
    // Filter by removed items.
    if (req.query.removed == 1) {
      whereClause += ' AND removed = ?';
      whereValues.push(1);
    } else {
      whereClause += ' AND removed = ?';
      whereValues.push(0);
    }
    // Sort by most visited.
    var sortBy, groupBy;
    if (req.query.sortBy === 'visits') {
      sortBy = 'visitCount';
      groupBy = 'url';
    } else {
      sortBy = 'timestamp';
      groupBy = null;
    }
    // Impose limit.
    var limit;
    if (req.query.limit > 0) {
      limit = req.query.limit;
    } else {
      limit = null;
    }
    db.select('History', null, null, whereClause, whereValues,
      function (err, rows) {
        var response = {
          'uuid': uuid,
          'total': rows.length,
          'history': []
        };
        rows.forEach(function (row) {
          delete row.uuid;
          response.history.push(row);
        });
        res.json(response);
      }, sortBy + ' DESC', limit, null, groupBy);
  });

  // Return form data by UUID in reverse chronological order.
  app.get('/api/form-data/:uuid', function(req, res) {
    uuid = req.params.uuid;
    whereClause = 'uuid=?';
    whereValues = [uuid];
    // Filter by date range.
    if (req.query.fromDate > 0) {
      whereClause += ' AND timestamp >= ?';
      whereValues.push(req.query.fromDate);
    }
    if (req.query.toDate > 0) {
      whereClause += ' AND timestamp <= ?';
      whereValues.push(req.query.toDate);
    }
    // Filter by keywords in url and data columns.
    if (req.query.contains) {
      searchStrings = req.query.contains.split(' ');
      searchStrings.forEach(function (searchString) {
        whereClause += " AND (url || data) LIKE '%' || ? || '%'";
        whereValues.push(searchString);
      });
    }
    // Impose limit.
    var limit;
    if (req.query.limit > 0) {
      limit = req.query.limit;
    } else {
      limit = null;
    }
    db.select('FormData', null, null, whereClause, whereValues,
      function (err, rows) {
        var response = {
          'uuid': uuid,
          'total': rows.length,
          'formData': []
        };
        rows.forEach(function (row) {
          delete row.uuid;
          response.formData.push(row);
        });
        res.json(response);
      }, 'timestamp DESC', limit);
  });

  // Return financial activity by UUID in reverse chronological order.
  app.get('/api/financials/:uuid', function(req, res) {
    uuid = req.params.uuid;
    whereClause = 'uuid=?';
    whereValues = [uuid];
    // Filter by date range.
    if (req.query.fromDate > 0) {
      whereClause += ' AND timestamp >= ?';
      whereValues.push(req.query.fromDate);
    }
    if (req.query.toDate > 0) {
      whereClause += ' AND timestamp <= ?';
      whereValues.push(req.query.toDate);
    }
    // Filter by keywords in url and data columns.
    if (req.query.contains) {
      searchStrings = req.query.contains.split(' ');
      searchStrings.forEach(function (searchString) {
        whereClause += " AND (description) LIKE '%' || ? || '%'";
        whereValues.push(searchString);
      });
    }
    // Impose limit.
    var limit;
    if (req.query.limit > 0) {
      limit = req.query.limit;
    } else {
      limit = null;
    }
    db.select('FinancialActivity', null, null, whereClause, whereValues,
      function (err, rows) {
        var response = {
          'uuid': uuid,
          'total': rows.length,
          'financialActivity': []
        };
        rows.forEach(function (row) {
          delete row.uuid;
          response.financialActivity.push(row);
        });
        res.json(response);
      }, 'timestamp DESC', limit);
  });
};
