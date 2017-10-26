chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  var screenshotImg = document.createElement('img');
  screenshotImg.id = 'sampleTarget';
  screenshotImg.src = request.url;
  document.body.appendChild(screenshotImg);
  return true;
})
