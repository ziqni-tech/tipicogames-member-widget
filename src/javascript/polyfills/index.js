//
if (!window.console) {
  window.console = function () {
  };

  if (typeof XDomainRequest !== 'undefined') {
    window.console.prototype.log = function (err) {
      throw new SyntaxError(err);
    };
    window.console.prototype.warn = function (err) {
      throw new SyntaxError(err);
    };
    window.console.prototype.error = function (err) {
      throw new SyntaxError(err);
    };
  }
}

//
try {
  Event.prototype.preventDefault || (Event.prototype.preventDefault = function () {
    this.returnValue = !1;
  });
} catch (err) {
  console.log(err);
}

//
try {
  Event.prototype.stopPropagation || (Event.prototype.stopPropagation = function () {
    this.cancelBubble = !0;
  });
} catch (err) {
  console.log(err);
}

//
try {
  if (!Element.prototype.addEventListener) {
    var eventListeners = []; var addEventListener = function (e, t) {
      var n; var r = this;
      if (n = function (e) {
        e.target = e.srcElement, e.currentTarget = r, e.pageX = event.clientX + document.body.scrollLeft, e.pageY = event.clientY + document.body.scrollTop, t.handleEvent ? t.handleEvent(e) : t.call(r, e);
      }, e === 'DOMContentLoaded') {
        var o = function (e) {
          document.readyState === 'complete' && n(e);
        };
        if (document.attachEvent('onreadystatechange', o), eventListeners.push({
          object: this,
          type: e,
          listener: t,
          wrapper: o
        }), document.readyState == 'complete') {
          var i = new Event();
          i.srcElement = window, o(i);
        }
      } else this.attachEvent('on' + e, n), eventListeners.push({ object: this, type: e, listener: t, wrapper: n });
    }; var removeEventListener = function (e, t) {
      for (var n = 0; n < eventListeners.length;) {
        var r = eventListeners[n];
        if (r.object == this && r.type == e && r.listener == t) {
          e == 'DOMContentLoaded' ? this.detachEvent('onreadystatechange', r.wrapper) : this.detachEvent('on' + e, r.wrapper);
          break;
        }
        ++n;
      }
    };
    Element.prototype.addEventListener = addEventListener, Element.prototype.removeEventListener = removeEventListener, HTMLDocument && (HTMLDocument.prototype.addEventListener = addEventListener, HTMLDocument.prototype.removeEventListener = removeEventListener), Window && (Window.prototype.addEventListener = addEventListener, Window.prototype.removeEventListener = removeEventListener);
  }
  Element.prototype.remove || (Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
  }, NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (var e = 0, t = this.length; t > e; e++) this[e] && this[e].parentElement && this[e].parentElement.removeChild(this[e]);
  });
} catch (err) {
  console.log(err);
}
typeof XDomainRequest !== 'undefined' && (typeof window.JSON !== 'object' && (window.JSON = {}), (function () {
  'use strict';

  function f (e) {
    return e < 10 ? '0' + e : e;
  }

  function quote (e) {
    return escapable.lastIndex = 0, escapable.test(e) ? '"' + e.replace(escapable, function (e) {
      var t = meta[e];
      return typeof t === 'string' ? t : '\\u' + ('0000' + e.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + e + '"';
  }

  function str (e, t) {
    var n; var r; var o; var i; var a; var p = gap; var u = t[e];
    switch (u && typeof u === 'object' && typeof u.toJSON === 'function' && (u = u.toJSON(e)), typeof rep === 'function' && (u = rep.call(t, e, u)), typeof u) {
      case 'string':
        return quote(u);
      case 'number':
        return isFinite(u) ? String(u) : 'null';
      case 'boolean':
      case 'null':
        return String(u);
      case 'object':
        if (!u) return 'null';
        if (gap += indent, a = [], Object.prototype.toString.apply(u) === '[object Array]') {
          for (i = u.length, n = 0; i > n; n += 1) a[n] = str(n, u) || 'null';
          return o = a.length === 0 ? '[]' : gap ? '[\n' + gap + a.join(',\n' + gap) + '\n' + p + ']' : '[' + a.join(',') + ']', gap = p, o;
        }
        if (rep && typeof rep === 'object') for (i = rep.length, n = 0; i > n; n += 1) typeof rep[n] === 'string' && (r = rep[n], o = str(r, u), o && a.push(quote(r) + (gap ? ': ' : ':') + o)); else for (r in u) Object.prototype.hasOwnProperty.call(u, r) && (o = str(r, u), o && a.push(quote(r) + (gap ? ': ' : ':') + o));
        return o = a.length === 0 ? '{}' : gap ? '{\n' + gap + a.join(',\n' + gap) + '\n' + p + '}' : '{' + a.join(',') + '}', gap = p, o;
    }
  }

  typeof Date.prototype.toJSON !== 'function' && (Date.prototype.toJSON = function () {
    return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null;
  }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () {
    return this.valueOf();
  });
  var cx, escapable, gap, indent, meta, rep;
  typeof window.JSON.stringify !== 'function' && (escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, meta = {
    '\b': '\\b',
    '	': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\'
  }, window.JSON.stringify = function (e, t, n) {
    var r;
    if (gap = '', indent = '', typeof n === 'number') for (r = 0; n > r; r += 1) indent += ' '; else typeof n === 'string' && (indent = n);
    if (rep = t, t && typeof t !== 'function' && (typeof t !== 'object' || typeof t.length !== 'number')) throw new Error('JSON.stringify');
    return str('', { '': e });
  }), typeof window.JSON.parse !== 'function' && (cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, window.JSON.parse = function (text, reviver) {
    function walk (e, t) {
      var n; var r; var o = e[t];
      if (o && typeof o === 'object') for (n in o) Object.prototype.hasOwnProperty.call(o, n) && (r = walk(o, n), void 0 !== r ? o[n] = r : delete o[n]);
      return reviver.call(e, t, o);
    }

    var j;
    if (text = String(text), cx.lastIndex = 0, cx.test(text) && (text = text.replace(cx, function (e) {
      return '\\u' + ('0000' + e.charCodeAt(0).toString(16)).slice(-4);
    })), /^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) return j = eval('(' + text + ')'), typeof reviver === 'function' ? walk({ '': j }, '') : j;
    throw new SyntaxError('JSON.parse');
  });
}()));

//
var _slice = Array.prototype.slice;

try {
  _slice.call(document.documentElement);
} catch (e) {
  Array.prototype.slice = function (t, e) {
    if (e = typeof e !== 'undefined' ? e : this.length, Object.prototype.toString.call(this) === '[object Array]') return _slice.call(this, t, e);
    var r; var i; var c = []; var l = this.length; var o = t || 0;
    o = o >= 0 ? o : l + o;
    var a = e || l;
    if (e < 0 && (a = l + e), i = a - o, i > 0) if (c = new Array(i), this.charAt) for (r = 0; i > r; r++) c[r] = this.charAt(o + r); else for (r = 0; i > r; r++) c[r] = this[o + r];
    return c;
  };
}

// [EventSource] Polyfill fix: https://github.com/remy/polyfills/blob/master/EventSource.js

(function (global) {
  if ('EventSource' in global) return;
  var reTrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
  var EventSource = function (url) {
    var eventsource = this; var interval = 500; /* polling interval  */ var lastEventId = null; var cache = '';
    if (!url || typeof url !== 'string') {
      throw new SyntaxError('Not enough arguments');
    }
    this.URL = url;
    this.readyState = this.CONNECTING;
    this._pollTimer = null;
    this._xhr = null;

    function pollAgain (interval) {
      eventsource._pollTimer = setTimeout(function () {
        poll.call(eventsource);
      }, interval);
    }

    function poll () {
      try { /* force hiding of the error message... insane? */
        if (eventsource.readyState === eventsource.CLOSED) return; /* NOTE: IE7 and upwards support */
        var xhr = new XMLHttpRequest();
        xhr.open('GET', eventsource.URL, true);
        xhr.setRequestHeader('Accept', 'text/event-stream');
        xhr.setRequestHeader('Cache-Control', 'no-cache'); /* we must make use of this on the server side if we're working with Android - because they don't trigger readychange until the server connection is closed */
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        if (lastEventId != null) xhr.setRequestHeader('Last-Event-ID', lastEventId);
        cache = '';
        xhr.timeout = 50000;
        xhr.onreadystatechange = function () {
          if (this.readyState == 3 || (this.readyState == 4 && this.status == 200)) { /* on success */
            if (eventsource.readyState == eventsource.CONNECTING) {
              eventsource.readyState = eventsource.OPEN;
              eventsource.dispatchEvent('open', { type: 'open' });
            }
            var responseText = '';
            try {
              responseText = this.responseText || '';
            } catch (e) {
            } /* process this.responseText */
            var parts = responseText.substr(cache.length).split('\n'); var eventType = 'message'; var data = []; var i = 0;
            var line = '';
            cache = responseText; /* TODO handle 'event' (for buffer name), retry */
            for (; i < parts.length; i++) {
              line = parts[i].replace(reTrim, '');
              if (line.indexOf('event') === 0) {
                eventType = line.replace(/event:?\s*/, '');
              } else if (line.indexOf('retry') === 0) {
                var retry = parseInt(line.replace(/retry:?\s*/, ''));
                if (!isNaN(retry)) {
                  interval = retry;
                }
              } else if (line.indexOf('data') === 0) {
                data.push(line.replace(/data:?\s*/, ''));
              } else if (line.indexOf('id:') === 0) {
                lastEventId = line.replace(/id:?\s*/, '');
              } else if (line.indexOf('id') === 0) { /* this resets the id */
                lastEventId = null;
              } else if (line === '') {
                if (data.length) {
                  var event = new MessageEvent(data.join('\n'), eventsource.url, lastEventId);
                  eventsource.dispatchEvent(eventType, event);
                  data = [];
                  eventType = 'message';
                }
              }
            }
            if (this.readyState === 4) pollAgain(interval); /* don't need to poll again, because we're long-loading */
          } else if (eventsource.readyState !== eventsource.CLOSED) {
            if (this.readyState === 4) { /* and some other status dispatch error */
              eventsource.readyState = eventsource.CONNECTING;
              eventsource.dispatchEvent('error', { type: 'error' });
              pollAgain(interval);
            } else if (this.readyState === 0) { /* likely aborted */
              pollAgain(interval);
            } else {
            }
          }
        };
        xhr.send();
        setTimeout(function () {
          if (true || xhr.readyState === 3) xhr.abort();
        }, xhr.timeout);
        eventsource._xhr = xhr;
      } catch (e) { /* in an attempt to silence the errors */
        eventsource.dispatchEvent('error', { type: 'error', data: e.message }); /* ??? */
      }
    };

    poll(); /* init now */
  };
  EventSource.prototype = {
    close: function () { /* closes the connection - disabling the polling */
      this.readyState = this.CLOSED;
      clearInterval(this._pollTimer);
      this._xhr.abort();
    },
    CONNECTING: 0,
    OPEN: 1,
    CLOSED: 2,
    dispatchEvent: function (type, event) {
      var handlers = this['_' + type + 'Handlers'];
      if (handlers) {
        for (var i = 0; i < handlers.length; i++) {
          handlers[i].call(this, event);
        }
      }
      if (this['on' + type]) {
        this['on' + type].call(this, event);
      }
    },
    addEventListener: function (type, handler) {
      if (!this['_' + type + 'Handlers']) {
        this['_' + type + 'Handlers'] = [];
      }
      this['_' + type + 'Handlers'].push(handler);
    },
    removeEventListener: function (type, handler) {
      var handlers = this['_' + type + 'Handlers'];
      if (!handlers) {
        return;
      }
      for (var i = handlers.length - 1; i >= 0; --i) {
        if (handlers[i] === handler) {
          handlers.splice(i, 1);
          break;
        }
      }
    },
    onerror: null,
    onmessage: null,
    onopen: null,
    readyState: 0,
    URL: ''
  };
  var MessageEvent = function (data, origin, lastEventId) {
    this.data = data;
    this.origin = origin;
    this.lastEventId = lastEventId || '';
  };
  MessageEvent.prototype = { data: null, type: 'message', lastEventId: '', origin: '' };
  if ('module' in global) module.exports = EventSource;
  global.EventSource = EventSource;
})(window);
