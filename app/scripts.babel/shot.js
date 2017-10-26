chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  var screenshotImg = document.createElement('img');
  screenshotImg.id = 'sampleTarget';
  screenshotImg.src = request.url;
  screenshotImg.addEventListener('click', () => document.body.removeChild(screenshotImg), false);
  document.body.appendChild(screenshotImg);
  return true;
})
