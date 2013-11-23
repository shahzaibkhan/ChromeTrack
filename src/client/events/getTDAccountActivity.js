// Define port.
var port = chrome.runtime.connect({name: 'TDAccountActivity'});

// Define CSV parser.
var parseCSV = function (csvData) {
  header = 'date,description,debit,credit,balance\n';
  csvData = header + csvData;
  csvArray = $.csv.toObjects(csvData);
  csvArray.forEach(function (row) {
    row.date = Date.parse(row.date);
    row.debit = parseFloat(row.debit);
    row.credit = parseFloat(row.credit);
    row.balance = parseFloat(row.balance);
  });
  return csvArray;
};

// Define CSV retrieval function.
var getCSV = function (accountNum, downloadID, period) {
  // Construct query string.
  queryString = {
    "selaccounts": downloadID,
    "DateRange": period,
    "PFM": "csv",
    "xptype": "PRXP",
    "actiontaken": null,
    "referer": "AA",
    "commingfrom": "AA",
    "ExprtInfo": null
  };
  // Send POST request.
  $.post("/servlet/ca.tdbank.banking.servlet.DownloadAccountActivityServlet",
    queryString, function (csvData) {
      response = {};
      response.institution = 'TD';
      response.accountNum = accountNum;
      response.downloadID = downloadID;
      response.period = period;
      response.transactions = parseCSV(csvData);
      port.postMessage(response);
    });
};

// Define frame.
var frameSrc = $('frameset frame[name=tddetails]')[0].src;
var frameContents = top.frames["tddetails"].document;

// If frame exists:
if (top.frames["tddetails"]) {
  // If frame's src contains FinancialSummaryServlet:
  if (frameSrc.indexOf('FinancialSummaryServlet') > -1) {
    // Get list of account numbers and their download IDs.
    var accountNums = $('span.td-copy-nowrap', frameContents).toArray();
    var downloadIDs = $('input[name^=download]', frameContents).toArray();
    // Define transaction periods.
    var periods = ['L10', 'TMT', 'L31', 'M1', 'M2', 'M3', 'M4', 'M5'];
    // Get CSV for each period of each account.
    for (var i = 0; i < downloadIDs.length; i++) {
      accountNum = accountNums[i].innerHTML;
      downloadID = downloadIDs[i].value;
      periods.forEach(function (period) {
        getCSV(accountNum, downloadID, period);
      });
    }
  }
}
