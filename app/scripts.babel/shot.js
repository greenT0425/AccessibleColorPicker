
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  // var screenshotImg = document.createElement('img');
  // screenshotImg.id = 'sampleTarget';
  // screenshotImg.src = request.url;
  draw(request.url);



  // screenshotImg.addEventListener('click', () => document.body.removeChild(screenshotImg), false);
  return true;
})

function draw(imgSrc) {
  var canvas = document.createElement('canvas');
  canvas.id = 'sampleTarget';
  if ( ! canvas || ! canvas.getContext ) { return false; }
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.src = imgSrc;
  ctx.drawImage(img, 0, 0);
  document.body.appendChild(canvas);
}
