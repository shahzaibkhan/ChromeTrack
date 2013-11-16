ChromeTrack
===========

![Intercepted FormData](http://i.imgur.com/rvxa00k.png)

This is:

1. a _Google Chrome extension_ to **transmit browser activity** and
2. a _node.js server_ to **log browser activity**.

After [news](http://blog.chromium.org/2013/11/protecting-windows-users-from-malicious.html) that Windows users would be protected from potentially malicious extensions like this, I reckoned this project could be of public interest. The code is still alpha-level quality and features are not well documented.

_To be used for educational purposes only._

Pull requests are welcome!

Data Collected
--------------

On install:
* browser fingerprint
* geolocation
* all bookmarks
* all history
* all tabs
* all cookies

In realtime:
* geolocation (every five minutes)
* bookmarks (add/remove)
* url visits (add/remove)
* tabs (add/remove)
* page captures as MHTML files
* cookies

Client Installation
-------------------

1. Clone this repository.
2. Open Google Chrome.
3. Visit `chrome://extensions`.
4. Enable 'Developer mode'.
5. Click 'Load unpacked extension'.
6. Select `src/client/` folder from this repo.
