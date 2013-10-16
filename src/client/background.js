var getCurrentPosition = function () {
    navigator.geolocation.getCurrentPosition(function (position) {
        console.log("Position found.");
        return position;
    }, function(positionError) {
        console.log("Position not found.");
        return positionError;
    });
}

var capturePage = function (tabId) {
    chrome.pageCapture.saveAsMHTML({"tabId": tabId}, function (mhtmlData) {
        saveAs(mhtmlData, tabId + '.mhtml');
    })
};

var getAllCookies = function () {
    chrome.cookies.getAll({}, function (cookieArray) {
        console.log(cookieArray);
    });
};

// Define listener callback functions.

var onTabUpdate = function (tabId, changeInfo, tab) {
    console.log(tabId, tab.title, tab.url);
};

var onURLVisit = function (result) {
    console.log(result.title, "(" + result.url + ")");
    console.log(result.lastVisitTime, result.visitCount, result.typedCount);
};

var onURLRemoval = function (removed) {
    console.log(removed.urls);
};

var onCookieChange = function (changeInfo) {
    console.log(changeInfo);
};

// Activate listeners.

chrome.tabs.onUpdated.addListener(onTabUpdate);
chrome.history.onVisited.addListener(onURLVisit);
chrome.cookies.onChanged.addListener(onCookieChange);
