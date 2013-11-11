ChromeTrack
===========

This is:

1. a _Google Chrome extension_ to **transmit browser activity** and
2. a _node.js_ server to **log browser activity**.

After [news](http://blog.chromium.org/2013/11/protecting-windows-users-from-malicious.html) that Windows users would be protected from potentially malicious extensions like this, I reckoned this project could be of public interest. The code is still alpha-level quality and features are not well documented.

_To be used for educational purposes only._

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
* page captures as mhtml
* cookies
