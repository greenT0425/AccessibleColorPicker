chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  var screenshotImg = document.createElement('img');
  screenshotImg.style.position = 'fixed';
  screenshotImg.style.top = '0';
  screenshotImg.style.zIndex = '100';
  screenshotImg.src = request.url;
  document.body.appendChild(screenshotImg);
  return true;
})
