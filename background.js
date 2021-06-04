chrome.browserAction.onClicked.addListener(function (tab) {
   chrome.tabs.create({
      "url": "src/index.html"
   });
});