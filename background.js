chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
     "url": "src/nav-wrapper.html"
  });
});
