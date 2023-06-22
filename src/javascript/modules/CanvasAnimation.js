import mergeObjects from '../utils/mergeObjects';
import query from '../utils/query';

// taken reference from https://stackoverflow.com/questions/48234696/how-to-put-a-gif-with-canvas/48348567#answer-48348567
const GIF = function () {
  var timerID; // timer handle for set time out usage
  var st; // holds the stream object when loading.
  var interlaceOffsets = [0, 4, 2, 1]; // used in de-interlacing.
  var interlaceSteps = [8, 8, 4, 2];
  var interlacedBufSize; // this holds a buffer to de interlace. Created on the first frame and when size changed
  var deinterlaceBuf;
  var pixelBufSize; // this holds a buffer for pixels. Created on the first frame and when size changed
  var pixelBuf;
  const GIF_FILE = { // gif file data headers
    GCExt: 0xF9,
    COMMENT: 0xFE,
    APPExt: 0xFF,
    UNKNOWN: 0x01, // not sure what this is but need to skip it in parser
    IMAGE: 0x2C,
    EOF: 59, // This is entered as decimal
    EXT: 0x21
  };

  // simple buffered stream used to read from the file
  var Stream = function (data) {
    this.data = new Uint8ClampedArray(data);
    this.pos = 0;
    var len = this.data.length;
    this.getString = function (count) { // returns a string from current pos of len count
      var s = '';
      while (count--) {
        s += String.fromCharCode(this.data[this.pos++]);
      }
      return s;
    };

    this.readSubBlocks = function () { // reads a set of blocks as a string
      var size;
      var count;
      var data = '';
      do {
        count = size = this.data[this.pos++];
        while (count--) {
          data += String.fromCharCode(this.data[this.pos++]);
        }
      } while (size !== 0 && this.pos < len);
      return data;
    };

    this.readSubBlocksB = function () { // reads a set of blocks as binary
      var size;
      var count;
      var data = [];
      do {
        count = size = this.data[this.pos++];
        while (count--) {
          data.push(this.data[this.pos++]);
        }
      } while (size !== 0 && this.pos < len);
      return data;
    };
  };

  // LZW decoder uncompressed each frames pixels
  // this needs to be optimised.
  // minSize is the min dictionary as powers of two
  // size and data is the compressed pixels
  function lzwDecode (minSize, data) {
    var i, pixelPos, pos, clear, eod, size, done, dic, code, last, d, len;
    pos = pixelPos = 0;
    dic = [];
    clear = 1 << minSize;
    eod = clear + 1;
    size = minSize + 1;
    done = false;
    while (!done) { // JavaScript optimisers like a clear exit though I never use 'done' apart from fooling the optimiser
      last = code;
      code = 0;
      for (i = 0; i < size; i++) {
        if (data[pos >> 3] & (1 << (pos & 7))) {
          code |= 1 << i;
        }
        pos++;
      }
      if (code === clear) { // clear and reset the dictionary
        dic = [];
        size = minSize + 1;
        for (i = 0; i < clear; i++) {
          dic[i] = [i];
        }
        dic[clear] = [];
        dic[eod] = null;
      } else {
        if (code === eod) {
          done = true;
          return;
        }
        if (code >= dic.length) {
          dic.push(dic[last].concat(dic[last][0]));
        } else if (last !== clear) {
          dic.push(dic[last].concat(dic[code][0]));
        }
        d = dic[code];
        len = d.length;
        for (i = 0; i < len; i++) {
          pixelBuf[pixelPos++] = d[i];
        }
        if (dic.length === (1 << size) && size < 12) {
          size++;
        }
      }
    }
  }

  function parseColourTable (count) { // get a colour table of length count  Each entry is 3 bytes, for RGB.
    var colours = [];
    for (var i = 0; i < count; i++) {
      colours.push([st.data[st.pos++], st.data[st.pos++], st.data[st.pos++]]);
    }
    return colours;
  }

  function parse () { // read the header. This is the starting point of the decode and async calls parseBlock
    var bitField;
    st.pos += 6;
    gif.width = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
    gif.height = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
    bitField = st.data[st.pos++];
    gif.colorRes = (bitField & 0b1110000) >> 4;
    gif.globalColourCount = 1 << ((bitField & 0b111) + 1);
    gif.bgColourIndex = st.data[st.pos++];
    st.pos++; // ignoring pixel aspect ratio. if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
    if (bitField & 0b10000000) {
      gif.globalColourTable = parseColourTable(gif.globalColourCount);
    } // global colour flag
    setTimeout(parseBlock, 0);
  }

  function parseAppExt () { // get application specific data. Netscape added iterations and terminator. Ignoring that
    st.pos += 1;
    if (st.getString(8) === 'NETSCAPE') {
      st.pos += 8;
    } else { // ignoring this data. iterations (word) and terminator (byte)
      st.pos += 3; // 3 bytes of string usually "2.0" when identifier is NETSCAPE
      st.readSubBlocks(); // unknown app extension
    }
  }

  function parseGCExt () { // get GC data
    var bitField;
    st.pos++;
    bitField = st.data[st.pos++];
    gif.disposalMethod = (bitField & 0b11100) >> 2;
    gif.transparencyGiven = !!(bitField & 0b1); // ignoring bit two that is marked as  userInput???
    gif.delayTime = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
    gif.transparencyIndex = st.data[st.pos++];
    st.pos++;
  }

  function parseImg () { // decodes image data to create the indexed pixel image
    var deinterlace;
    var frame;
    var bitField;

    deinterlace = function (width) { // de interlace pixel data if needed
      var lines, fromLine, pass, toLine;
      lines = pixelBufSize / width;
      fromLine = 0;
      if (interlacedBufSize !== pixelBufSize) { // create the buffer if size changed or undefined.
        deinterlaceBuf = new Uint8Array(pixelBufSize);
        interlacedBufSize = pixelBufSize;
      }
      for (pass = 0; pass < 4; pass++) {
        for (toLine = interlaceOffsets[pass]; toLine < lines; toLine += interlaceSteps[pass]) {
          deinterlaceBuf.set(pixelBuf.subArray(fromLine, fromLine + width), toLine * width);
          fromLine += width;
        }
      }
    };
    frame = {};
    gif.frames.push(frame);
    frame.disposalMethod = gif.disposalMethod;
    frame.time = gif.length;
    frame.delay = gif.delayTime * 10;
    gif.length += frame.delay;
    if (gif.transparencyGiven) {
      frame.transparencyIndex = gif.transparencyIndex;
    } else {
      frame.transparencyIndex = undefined;
    }
    frame.leftPos = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
    frame.topPos = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
    frame.width = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
    frame.height = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
    bitField = st.data[st.pos++];
    frame.localColourTableFlag = !!(bitField & 0b10000000);
    if (frame.localColourTableFlag) {
      frame.localColourTable = parseColourTable(1 << ((bitField & 0b111) + 1));
    }
    if (pixelBufSize !== frame.width * frame.height) { // create a pixel buffer if not yet created or if current frame size is different from previous
      pixelBuf = new Uint8Array(frame.width * frame.height);
      pixelBufSize = frame.width * frame.height;
    }
    lzwDecode(st.data[st.pos++], st.readSubBlocksB()); // decode the pixels
    if (bitField & 0b1000000) { // de interlace if needed
      frame.interlaced = true;
      deinterlace(frame.width);
    } else {
      frame.interlaced = false;
    }
    processFrame(frame); // convert to canvas image
  }

  function processFrame (frame) { // creates a RGBA canvas image from the indexed pixel data.
    var ct;
    var cData;
    var dat;
    var pixCount;
    var ind;
    var useT;
    var i;
    var pixel;
    var pDat;
    var col;
    // var frame;
    var ti;

    frame.image = document.createElement('canvas');
    frame.image.width = gif.width;
    frame.image.height = gif.height;
    frame.image.ctx = frame.image.getContext('2d');
    ct = frame.localColourTableFlag ? frame.localColourTable : gif.globalColourTable;
    if (gif.lastFrame === null) {
      gif.lastFrame = frame;
    }
    useT = (gif.lastFrame.disposalMethod === 2 || gif.lastFrame.disposalMethod === 3);
    if (!useT) {
      frame.image.ctx.drawImage(gif.lastFrame.image, 0, 0, gif.width, gif.height);
    }
    cData = frame.image.ctx.getImageData(frame.leftPos, frame.topPos, frame.width, frame.height);
    ti = frame.transparencyIndex;
    dat = cData.data;
    if (frame.interlaced) {
      pDat = deinterlaceBuf;
    } else {
      pDat = pixelBuf;
    }
    pixCount = pDat.length;
    ind = 0;
    for (i = 0; i < pixCount; i++) {
      pixel = pDat[i];
      col = ct[pixel];
      if (ti !== pixel) {
        dat[ind++] = col[0];
        dat[ind++] = col[1];
        dat[ind++] = col[2];
        dat[ind++] = 255; // Opaque.
      } else if (useT) {
        dat[ind + 3] = 0; // Transparent.
        ind += 4;
      } else {
        ind += 4;
      }
    }
    frame.image.ctx.putImageData(cData, frame.leftPos, frame.topPos);
    gif.lastFrame = frame;
    if (!gif.waitTillDone && typeof gif.onload === 'function') {
      doOnloadEvent();
    }// if !waitTillDone the call onload now after first frame is loaded
  };

  function finnished () { // called when the load has completed
    gif.loading = false;
    gif.frameCount = gif.frames.length;
    st = undefined;
    gif.complete = true;
    gif.disposalMethod = undefined;
    gif.transparencyGiven = undefined;
    gif.delayTime = undefined;
    gif.transparencyIndex = undefined;
    gif.waitTillDone = undefined;
    pixelBuf = undefined; // dereference pixel buffer
    deinterlaceBuf = undefined; // dereference interlace buff (may or may not be used);
    pixelBufSize = undefined;
    deinterlaceBuf = undefined;
    gif.currentFrame = 0;
    if (gif.frames.length > 0) {
      gif.image = gif.frames[0].image;
    }
    doOnloadEvent();
    if (typeof gif.onloadall === 'function') {
      (gif.onloadall.bind(gif))({
        type: 'loadall',
        path: [gif]
      });
    }
    if (gif.playOnLoad) {
      gif.play();
    }
    gif.finished(gif, gif.lastFrame);
    // gif.lastFrame = null;
  }

  function canceled () { // called if the load has been cancelled
    finnished();
    if (typeof gif.cancelCallback === 'function') {
      (gif.cancelCallback.bind(gif))({
        type: 'canceled',
        path: [gif]
      });
    }
  }

  function parseExt () { // parse extended blocks
    const blockID = st.data[st.pos++];
    if (blockID === GIF_FILE.GCExt) {
      parseGCExt();
    } else if (blockID === GIF_FILE.COMMENT) {
      gif.comment += st.readSubBlocks();
    } else if (blockID === GIF_FILE.APPExt) {
      parseAppExt();
    } else {
      if (blockID === GIF_FILE.UNKNOWN) {
        st.pos += 13;
      } // skip unknow block
      st.readSubBlocks();
    }
  }

  function parseBlock () { // parsing the blocks
    if (gif.cancel !== undefined && gif.cancel === true) {
      canceled();
      return;
    }

    const blockId = st.data[st.pos++];
    if (blockId === GIF_FILE.IMAGE) { // image block
      parseImg();
      if (gif.firstFrameOnly) {
        finnished();
        return;
      }
    } else if (blockId === GIF_FILE.EOF) {
      finnished();
      return;
    } else {
      parseExt();
    }

    if (typeof gif.onprogress === 'function') {
      gif.onprogress({
        bytesRead: st.pos,
        totalBytes: st.data.length,
        frame: gif.frames.length
      });
    }
    setTimeout(parseBlock, 0); // parsing frame async so processes can get some time in.
  }

  function cancelLoad (callback) { // cancels the loading. This will cancel the load before the next frame is decoded
    if (gif.complete) {
      return false;
    }
    gif.cancelCallback = callback;
    gif.cancel = true;
    return true;
  }

  function error (type) {
    if (typeof gif.onerror === 'function') {
      (gif.onerror.bind(this))({
        type: type,
        path: [this]
      });
    }
    gif.onload = gif.onerror = undefined;
    gif.loading = false;
  }

  function doOnloadEvent () { // fire onload event if set
    gif.currentFrame = 0;
    gif.nextFrameAt = gif.lastFrameAt = new Date().valueOf(); // just sets the time now
    if (typeof gif.onload === 'function') {
      (gif.onload.bind(gif))({
        type: 'load',
        path: [gif]
      });
    }
    gif.onerror = gif.onload = undefined;
  }

  function dataLoaded (data) { // Data loaded create stream and parse
    st = new Stream(data);
    parse();
  }

  function loadGif (filename) { // starts the load
    var ajax = new XMLHttpRequest();
    ajax.responseType = 'arraybuffer';
    ajax.onload = function (e) {
      if (e.target.status === 404) {
        error('File not found');
      } else if (e.target.status >= 200 && e.target.status < 300) {
        dataLoaded(ajax.response);
      } else {
        error('Loading error : ' + e.target.status);
      }
    };
    ajax.open('GET', filename, true);
    ajax.send();
    ajax.onerror = function (e) {
      error('File error');
    };
    this.src = filename;
    this.loading = true;
  }

  function play () { // starts play if paused
    if (!gif.playing) {
      gif.paused = false;
      gif.playing = true;
      playing();
    }
  }

  function pause () { // stops play
    gif.paused = true;
    gif.playing = false;
    clearTimeout(timerID);
  }

  function togglePlay () {
    if (gif.paused || !gif.playing) {
      gif.play();
    } else {
      gif.pause();
    }
  }

  function seekFrame (frame) { // seeks to frame number.
    clearTimeout(timerID);
    gif.currentFrame = frame % gif.frames.length;
    if (gif.playing) {
      playing();
    } else {
      gif.image = gif.frames[gif.currentFrame].image;
    }
  }

  function seek (time) { // time in Seconds  // seek to frame that would be displayed at time
    clearTimeout(timerID);
    if (time < 0) {
      time = 0;
    }
    time *= 1000; // in ms
    time %= gif.length;
    var frame = 0;
    while (time > gif.frames[frame].time + gif.frames[frame].delay && frame < gif.frames.length) {
      frame += 1;
    }
    gif.currentFrame = frame;
    if (gif.playing) {
      playing();
    } else {
      gif.image = gif.frames[gif.currentFrame].image;
    }
  }

  function playing () {
    var delay;
    var frame;
    if (gif.playSpeed === 0) {
      gif.pause();
    } else {
      if (gif.playSpeed < 0) {
        gif.currentFrame -= 1;
        if (gif.currentFrame < 0) {
          gif.currentFrame = gif.frames.length - 1;
        }
        frame = gif.currentFrame;
        frame -= 1;
        if (frame < 0) {
          frame = gif.frames.length - 1;
        }
        delay = -gif.frames[frame].delay * 1 / gif.playSpeed;
      } else {
        gif.currentFrame += 1;
        gif.currentFrame %= gif.frames.length;
        delay = gif.frames[gif.currentFrame].delay * 1 / gif.playSpeed;
      }
      gif.image = gif.frames[gif.currentFrame].image;
      timerID = setTimeout(playing, delay);
    }
  }

  var gif = { // the gif image object
    onload: null, // fire on load. Use waitTillDone = true to have load fire at end or false to fire on first frame
    onerror: null, // fires on error
    onprogress: null, // fires a load progress event
    onloadall: null, // event fires when all frames have loaded and gif is ready
    paused: false, // true if paused
    playing: false, // true if playing
    waitTillDone: true, // If true onload will fire when all frames loaded, if false, onload will fire when first frame has loaded
    loading: false, // true if still loading
    firstFrameOnly: false, // if true only load the first frame
    width: null, // width in pixels
    height: null, // height in pixels
    frames: [], // array of frames
    comment: '', // comments if found in file. Note I remember that some gifs have comments per frame if so this will be all comment concatenated
    length: 0, // gif length in ms (1/1000 second)
    currentFrame: 0, // current frame.
    frameCount: 0, // number of frames
    playSpeed: 1, // play speed 1 normal, 2 twice 0.5 half, -1 reverse etc...
    lastFrame: null, // temp hold last frame loaded so you can display the gif as it loads
    image: null, // the current image at the currentFrame
    playOnLoad: true, // if true starts playback when loaded
    // functions
    load: loadGif, // call this to load a file
    cancel: cancelLoad, // call to stop loading
    play: play, // call to start play
    pause: pause, // call to pause
    seek: seek, // call to seek to time
    seekFrame: seekFrame, // call to seek to frame
    togglePlay: togglePlay, // call to toggle play and pause state
    finished: function (instance) {} // call on finish
  };
  return gif;
};

export const CanvasAnimation = function (options) {
  var _this = this;

  this.settings = {
    container: null,
    containerWrapper: null,
    gifInstance: null,
    lbWidget: null,
    imageSrc: '',
    ctx: null,
    canvasWidth: null,
    canvasHeight: null,
    canvasWidthHalf: null,
    canvasHeightHalf: null,
    updateActive: true
  };

  if (typeof options !== 'undefined') {
    this.settings = mergeObjects(this.settings, options);
  }

  // main update function
  function update (timer) {
    if (_this.settings.updateActive) {
      _this.settings.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      if (_this.settings.canvasWidth !== innerWidth || _this.settings.canvasHeight !== innerHeight) {
        _this.settings.canvasWidthHalf = (_this.settings.canvasWidth = _this.settings.container.width = innerWidth) / 2;
        _this.settings.canvasHeightHalf = (_this.settings.canvasHeight = _this.settings.container.height = innerHeight) / 2;
      } else {
        _this.settings.ctx.clearRect(0, 0, _this.settings.canvasWidth, _this.settings.canvasHeight);
      }

      if (_this.settings.gifInstance !== null) { // If gif object defined
        if (!_this.settings.gifInstance.loading) { // if loaded
          // can do something here
        } else if (_this.settings.gifInstance.lastFrame !== null) { // Shows frames as they load
          _this.settings.ctx.drawImage(_this.settings.gifInstance.lastFrame.image, (_this.settings.canvasWidthHalf - (_this.settings.gifInstance.width / 2)), (_this.settings.canvasHeightHalf - (_this.settings.gifInstance.height / 2)));
        }
      }

      requestAnimationFrame(update);
    }
  }

  // reset transform
  this.clearCanvas = function () {
    _this.settings.ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  this.overlayLayout = function () {
    var wrapper = document.createElement('div');
    var canvas = document.createElement('canvas');

    wrapper.setAttribute('class', 'cl-widget-canvas-overlay-wrapper');
    canvas.setAttribute('class', 'cl-widget-canvas');

    wrapper.appendChild(canvas);

    return wrapper;
  };

  this.init = function () {
    if (this.settings.container === null) {
      this.settings.containerWrapper = this.settings.lbWidget.settings.bindContainer.appendChild(_this.overlayLayout());
      this.settings.container = query(this.settings.containerWrapper, '.cl-widget-canvas');
    }

    if (this.settings.container !== null && this.settings.imageSrc.length > 0) {
      _this.settings.containerWrapper.style.display = 'block'; // show container
      _this.settings.containerWrapper.style.opacity = 1; // show container
      _this.settings.ctx = _this.settings.container.getContext('2d');
      _this.settings.updateActive = true;

      // Can not load gif cross domain unless it has CORS header
      // const gifURL = "https://gateway.ziqni.com/alex/assets/Olp_TXUBp93_Cg_BQGsD/skull-animaiton.gif";
      const gifURL = _this.settings.imageSrc;
      // timeout just waits till script has been parsed and executed
      // then starts loading a gif
      setTimeout(() => {
        _this.settings.gifInstance = GIF(); // creates a new gif
        _this.settings.gifInstance.onerror = function (e) {
          console.log('asset loading error ' + e.type);
        };
        _this.settings.gifInstance.load(gifURL);
        _this.settings.gifInstance.finished = function (instance, lastFrame) {
          _this.settings.updateActive = false;

          // draw last frame
          // _this.settings.ctx.drawImage(lastFrame.image, 0, 0);
          // _this.settings.ctx.fillStyle = 'black';
          // _this.settings.ctx.fillText('GIF loading frame 22', 10, 20);

          setTimeout(function () {
            _this.settings.containerWrapper.style.opacity = 0;
            setTimeout(function () {
              _this.settings.containerWrapper.style.display = 'none';
            }, 300);
          }, 2000);
        };
      }, 0);

      _this.settings.canvasWidth = _this.settings.container.width;
      _this.settings.canvasHeight = _this.settings.container.height;
      _this.settings.canvasWidthHalf = _this.settings.canvasWidth / 2; // center
      _this.settings.canvasHeightHalf = _this.settings.canvasHeight / 2;

      // trigger ACH
      // _this.settings.lbWidget.settings.canvasAnimation.settings.imageSrc = 'https://gateway.ziqni.com/alex/assets/Olp_TXUBp93_Cg_BQGsD/skull-animaiton.gif';
      // _this.settings.lbWidget.settings.canvasAnimation.init();

      requestAnimationFrame(update);
    }
  };
};
