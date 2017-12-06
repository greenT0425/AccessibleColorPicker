// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
//   var screenshotImg = document.createElement('img');
//   screenshotImg.id = 'ACP_container';
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
    ACP_content,
    canvas,
    ctx,
    colors = [],
    img,
    ACP_display,
    ACP_text_display,
    inputs,
    ACP_sample_bg,
    ACP_sample_text,
    ACP_close,
    picker,
    holding = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(document.getElementById('ACP_container')) return false;
  init(request.url);
  return true;
})



function $id(id) { return document.getElementById(id); }

function init(url) {

    ACP_content = document.createElement('div');
    ACP_content.id = 'ACP_container';
    ACP_content.innerHTML = '<div id="ACP_content"><img id="img" src="" alt=""></div><div id="ACP_info"><div class="ACP_bg_color"><div id="ACP_display"></div><div><label>  <span>HEX:</span>  <input onclick="this.select(0,this.value.length)" id="hex" type="text" name="" value=""></label><label>  <span>RGB:</span>  <input onclick="this.select(0,this.value.length)" id="rgb" type="text" value="rgb(255, 0, 0)"></label><label>  <span>HSL:</span>  <input onclick="this.select(0,this.value.length)" id="hsl" type="text" value="hsl(360, 0%, 0%)"></label></div></div><div class="ACP_text_color">  <div id="ACP_text_display"></div> <div> <label>    <span>HEX:</span>    <input onclick="this.select(0,this.value.length)" id="text_hex" type="text" name="" value="">  </label>  <label>    <span>RGB:</span>    <input onclick="this.select(0,this.value.length)" id="text_rgb" type="text" value="rgb(255, 0, 0)">  </label>  <label>    <span>HSL:</span>    <input onclick="this.select(0,this.value.length)" id="text_hsl" type="text" value="hsl(360, 0%, 0%)">  </label></div></div><div id="ACP_sample_bg"><span id="ACP_sample_text">sampleですー</span></div><div id="ACP_close">閉じる</div></div><div id="ACP_cursor"></div>';
    document.body.appendChild(ACP_content);

    // 画像
    img = $id('img');
    img.addEventListener('load', loadComplete, false);
    img.src = url;
    img.srcset = url + ' 1x,' + url + ' 2x';
    // img.styles.width = '100%';

    // 色情報を取得するための canvas
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');

    // カラー表示
    ACP_display = $id('ACP_display');
    ACP_text_display = $id('ACP_text_display');
    inputs = {
        r: $id('r'), g: $id('g'), b: $id('b'), // RGB
        hex: $id('hex'), // HEX
        rgb: $id('rgb'), // HEX
        hsl: $id('hsl'), // HEX
        text_hex: $id('text_hex'), // HEX
        text_rgb: $id('text_rgb'), // HEX
        text_hsl: $id('text_hsl'), // HEX
        h: $id('h'), s: $id('s'), l: $id('l') // HSL
    };

    // サンプル背景
    ACP_sample_bg = $id('ACP_sample_bg');

    // サンプルテキスト
    ACP_sample_text = $id('ACP_sample_text');

    ACP_close = $id('ACP_close');
    ACP_close.addEventListener('click', closeAll, false);

    // ピッカー
    picker = $id('ACP_cursor');
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


    picker.style.left = e.clientX - 11 + 'px';
    picker.style.top = e.clientY - 11 + 'px';
    picker.style.backgroundColor = 'rgb(' + r + ', ' + g + ', ' + b + ')';
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


  	picker.style.display = 'block';
  	picker.style.left = e.clientX - 11 + 'px';
    picker.style.top = e.clientY - 11 + 'px';
  	picker.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';

    // カラー表示
    ACP_display.style.backgroundColor = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    inputs.hex.value = '#' + (b | (g << 8) | (r << 16)).toString(16).toUpperCase();
    inputs.rgb.value = 'rgb(' + r + ',' + g + ',' + b + ')';
    inputs.hsl.value = 'hsl(' + Math.round(h) + ',' + Math.round(s) + '%,' + Math.round(l) + '%)';

    var sampleColor = getAccessibleColor(r,g,b);
    ACP_text_display.style.backgroundColor =  'hsl(' + sampleColor[0] + ', ' + sampleColor[1]*100 + '%, ' + sampleColor[2]*100 + '%)';
    inputs.text_hex.value = '#' + (b | (g << 8) | (r << 16)).toString(16).toUpperCase();
    inputs.text_rgb.value = 'rgb(' + r + ',' + g + ',' + b + ')';
    inputs.text_hsl.value = 'hsl(' + Math.round(sampleColor[0]) + ',' + Math.round(sampleColor[1]*100) + '%,' + Math.round(sampleColor[2]*100) + '%)';

    ACP_sample_bg.style.backgroundColor = ACP_display.style.backgroundColor;
    ACP_sample_text.style.color =  'hsl(' + sampleColor[0] + ', ' + sampleColor[1]*100 + '%, ' + sampleColor[2]*100 + '%)';


}

function getAccessibleColor(r,g,b){


  // rgbから明るさを算出
  // 明るさの差は125以上
  var brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  var brightness_threshold = 125;
  var sample_brightness;
  if (brightness >= 128) {
    sample_brightness = brightness - brightness_threshold;
  }else {
    sample_brightness = brightness + brightness_threshold;
  }

  // 輝度L1、L2を計算式 dR x .2126 + dG x .7152 + dB x .0722 で算出。ただし、R'、G'、B'はRならばsR=R/255; R' = (sR <= 0.03928) ? sR/12.92 : ((sR+0.055)/1.055) ^ 2.4;としてガンマ補正したリニア化RGBの値とし、L1は前景、背景のうち輝度の大きい方の値、L2は小さい方の値とする
  // 輝度比は4.5以上
  var sR = r / 255;
  var sG = g / 255;
  var sB = b / 255;
  var dR = (sR <= 0.03928) ? sR/12.92 : Math.pow(((sR+0.055)/1.055),2.4);
  var dG = (sG <= 0.03928) ? sG/12.92 : Math.pow(((sG+0.055)/1.055),2.4);
  var dB = (sB <= 0.03928) ? sB/12.92 : Math.pow(((sB+0.055)/1.055),2.4);
  var luminosity = dR * .2126 + dG * .7152 + dB * .0722;
  var luminosity_threshold = 4.5;
  var sample_luminosity;
  var l1 = (luminosity + .05) * luminosity_threshold - .05;
  var l2 = (luminosity + .05) / luminosity_threshold - .05;

  // if (l1 - luminosity < .001 && l1 - luminosity > -.001) {
  //   sample_luminosity = l2;
  // }else{
  //   sample_luminosity = l1;
  // }
  // if (sample_luminosity>1 || sample_luminosity<0) {
  //   console.log('提案できる色がありません');
  //   if(sample_luminosity>1)sample_luminosity =1;
  //   if(sample_luminosity<0)sample_luminosity =0;
  // }

  if (luminosity>=.5) {
    console.log('あかるい');
    // luminosityが明るい場合
    sample_luminosity = (luminosity + .05) * luminosity_threshold - .05;
    if (sample_luminosity>1 || sample_luminosity<0) {
      sample_luminosity = (luminosity + .05) / luminosity_threshold - .05;
    }
  }else{
    console.log('くらい');
    // luminosityがくらい場合
    sample_luminosity = (luminosity + .05) / luminosity_threshold - .05;
    if (sample_luminosity>1 || sample_luminosity<0) {
      sample_luminosity = (luminosity + .05) * luminosity_threshold - .05;
    }
  }

  // return アクセシブルなhsl,それ以上か以下か
  var hslColor = rgbToHsl(r,g,b);
  hslColor[2] = sample_brightness/255;
  hslColor[2] = sample_luminosity;

  console.log('rgb:' + r + ',' + g + ',' + b + '\nhsl:' + hslColor +'\nluminosity:' + luminosity+ '\nl1:'+ l1+ '\nl2:'+ l2 +'\nsample_luminosity:' + sample_luminosity + '\n提案rgb:' + hsvToRgb(hslColor[0],hslColor[1],hslColor[2]) + '\n提案hsl:' + hslColor[0] +',' + hslColor[1] + ',' + hslColor[2]);

  // return hsvToRgb(hslColor[0],hslColor[1],sample_luminosity);
  return [hslColor[0],hslColor[1],sample_luminosity]
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

function hsvToRgb(h,s,v) {
    //https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV

    var C = v * s;
    var Hp = h / 60;
    var X = C * (1 - Math.abs(Hp % 2 - 1));

    var R, G, B;
    if (0 <= Hp && Hp < 1) {[R,G,B]=[C,X,0]};
    if (1 <= Hp && Hp < 2) {[R,G,B]=[X,C,0]};
    if (2 <= Hp && Hp < 3) {[R,G,B]=[0,C,X]};
    if (3 <= Hp && Hp < 4) {[R,G,B]=[0,X,C]};
    if (4 <= Hp && Hp < 5) {[R,G,B]=[X,0,C]};
    if (5 <= Hp && Hp < 6) {[R,G,B]=[C,0,X]};

    var m = v - C;
    [R, G, B] = [R+m, G+m, B+m];

    R = Math.floor(R * 255);
    G = Math.floor(G * 255);
    B = Math.floor(B * 255);

    return [R ,G, B];
}

function closeAll(){
  document.body.removeChild(ACP_content);
}
