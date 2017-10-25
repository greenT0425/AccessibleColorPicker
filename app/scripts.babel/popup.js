'use strict';

console.log('\'Allo \'Allo! Popup');
console.log(chrome.extension.getViews());
chrome.tabs.captureVisibleTab({format:"png"},function(screenshotUrl) {
  setScreenshotUrl(screenshotUrl);
});
function setScreenshotUrl(url) {
  document.getElementById('target').src = url;
}
