'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: '\'Allo'});

console.log('\'Allo \'Allo! Event Page for Browser Action');

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.query({ currentWindow: true, active: true },
    function (tabArray) {
      chrome.tabs.captureVisibleTab({format:'png'},function(screenshotUrl) {
        chrome.tabs.sendMessage(tabArray[0].id,{url:screenshotUrl});
      });
    });
});
