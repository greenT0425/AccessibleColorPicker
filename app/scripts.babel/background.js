'use strict';

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.query({ currentWindow: true, active: true },
    function (tabArray) {
      chrome.tabs.captureVisibleTab({format:'png'},function(screenshotUrl) {
        chrome.tabs.sendMessage(tabArray[0].id,{url:screenshotUrl});
      });
    }
  );
});
