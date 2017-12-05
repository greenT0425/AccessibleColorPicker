// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
//   var screenshotImg = document.createElement('img');
//   screenshotImg.id = 'sampleTarget';
//   screenshotImg.src = request.url;
//   screenshotImg.addEventListener('click', () => document.body.removeChild(screenshotImg), false);
//   document.body.appendChild(screenshotImg);
//
//   return true;
// })


/*
 * クリックして色を取得する座標を固定, もう一度クリックして解除　
 */

 // var IMG_URL = [
 //         'http://jsrun.it/assets/7/W/q/q/7WqqS.jpg',
 //         'http://jsrun.it/assets/i/C/b/9/iCb98.jpg'
 //     ],
var imgUrl = '',
    canvas,
    ctx,
    colors = [],
    img,
    display,
    inputs,
    picker,
    holding = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  init(request.url);
  return true;
})



function $id(id) { return document.getElementById(id); }

function init(url) {

    var testDiv = document.createElement('div');
    testDiv.id = 'sampleTarget';
    testDiv.innerHTML = '<div id="container"><img id="img" src="" alt=""></div><div id="info"><div id="display"></div><ul><li>#<input id="hex" size="6" type="text" value="FFFFFF"></li></ul><ul><li>R:<input id="r" size="3" type="text" value="255"></li><li>G:<input id="g" size="3" type="text" value="255"></li><li>B:<input id="b" size="3" type="text" value="255"></li></ul><ul><li>H:<input id="h" size="3" type="text" value="0"></li><li>S:<input id="s" size="3" type="text" value="0"></li><li>L:<input id="l" size="3" type="text" value="100"></li></ul></div><div id="cursor"></div>';
    document.body.appendChild(testDiv);

    // 画像
    img = $id('img');
    img.addEventListener('load', loadComplete, false);
    img.src = url;

    // 色情報を取得するための canvas
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');

    // カラー表示
    display = $id('display');
    inputs = {
        r: $id('r'), g: $id('g'), b: $id('b'), // RGB
        hex: $id('hex'), // HEX
        h: $id('h'), s: $id('s'), l: $id('l') // HSL
    };
    // ピッカー
    picker = $id('cursor');
}

function loadComplete() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    var w, h, data, n, r, g, b, hsl, hue, s, l;

    // 画像の色情報を取得
    w = canvas.width;
    h = canvas.height;
    data = ctx.getImageData(0, 0, w, h).data;

    for (var y = 0; y < h - 1; y++) {
        for (var x = 0; x < w - 1; x++) {
    	    n = x * 4 + y * w * 4;
            // RGB
    	    r = data[n]; g = data[n + 1]; b = data[n + 2];
            // HSL
    	    hsl = rgbToHsl(r, g, b);
            hue = Math.round(hsl[0]); s = Math.round(hsl[1] * 100); l = Math.round(hsl[2] * 100);
            colors.push([r, g, b, hue, s, l]);
        }
    }

    img.addEventListener('mousemove', mouseMove, false);
    img.addEventListener('mousedown', mouseDown, false);
}

function mouseMove(e) {
    if (holding) return;

    var mx, my, n, color, r, g, b, h, s, l;

    // カーソル位置からピクセルの配列位置を取得
    n = e.offsetX + e.offsetY * (img.width - 1);
    // Firefox の場合 (offsetX, offsetY から値が取れない場合)
    if (!n && n !== 0) {
	var pos = getElementPosition(img);
	n = (e.layerX - pos.x) + (e.layerY - pos.y) * (img.width - 1);
    }

    color = colors[n];
    if (!color) return;
    r = color[0]; g = color[1]; b = color[2];
    h = color[3]; s = color[4]; l = color[5];

    // カラー表示
    display.style.backgroundColor = 'rgb(' + r + ', ' + g + ', ' + b + ')';

    // RGB 情報
    inputs.r.value = r; inputs.g.value = g; inputs.b.value = b;
    inputs.hex.value = (b | (g << 8) | (r << 16)).toString(16).toUpperCase();

    // HSL 情報
    inputs.h.value = h; inputs.s.value = s; inputs.l.value = l;
}

/*
 * Firefox で要素上のマウス座標を取得するための要素位置を取得する関数
 */
function getElementPosition(elem) {
    var html, body, scrollLeft, scrollTop, rect;

    html = document.documentElement;
    body = document.body;
    scrollLeft = body.scrollLeft || html.scrollLeft;
    scrollTop = body.scrollTop || html.scrollTop;
    rect = elem.getBoundingClientRect();

    // Firefox では　getBoundingClientRect　で取得した値が 1px 少なくなるので足しておく
    return {
	x: Math.round(rect.left + 1 - html.clientLeft + scrollLeft),
	y: Math.round(rect.top + 1 - html.clientTop + scrollTop)
    };
}

function mouseDown(e) {
    if (!holding) {
    	picker.style.display = 'block';
    	picker.style.left = e.clientX - 2 + 'px';
      picker.style.top = e.clientY - 2 + 'px';
    	picker.style.backgroundColor = display.style.backgroundColor;
    } else {
    	picker.style.display = 'none';
    }
    holding = !holding;
}

/**
 * RGB -> HSL
 * それぞれ 0 ~ 255 で指定
 */
function rgbToHsl(r, g, b) {
    var h, s, l,
        max = Math.max(Math.max(r, g), b),
        min = Math.min(Math.min(r, g), b);

    // Hue, 0 ~ 359
    if (max === min) {
        h = 0;
    } else if (r === max) {
        h = ((g - b) / (max - min) * 60 + 360) % 360;
    } else if (g === max) {
        h = (b - r) / (max - min) * 60 + 120;
    } else if (b === max) {
        h = (r - g) / (max - min) * 60 + 240;
    }
    // Saturation, 0 ~ 1
    s = (max - min) / max;
    // Lightness, 0 ~ 1
    l = (r *  0.3 + g * 0.59 + b * 0.11) / 255;

    return [h, s, l, 'hsl'];
}
