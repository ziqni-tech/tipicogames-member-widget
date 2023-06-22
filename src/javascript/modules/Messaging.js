import cLabs from './cLabs';

/**
 * SSE Messaging
 * @param options {Object}
 * @constructor
 */
export const Messaging = function (options) {
  /**
   * Messaging settings
   * @memberOf Messaging
   * @constant
   * @type { Object }
   */
  this.settings = {
    source: null,
    ajax: {
      url: null,
      apiKey: undefined,
      errorCallback: function () {
      }
    },
    sseUrl: null,
    heartbeat: null,
    lastHeartbeat: null,
    mainAjax: new cLabs.Ajax(),
    heartBeatAjax: new cLabs.Ajax(),
    heartWaitTime: 25000,
    messageQueue: [],
    messageInterval: 1000,
    startupCheck: true,
    active: false,
    debug: false,
    callback: function (data) {
    },
    onStartupError: function () {
    }
  };

  if (typeof options !== 'undefined') {
    for (var opt in options) {
      if (options.hasOwnProperty(opt)) {
        this.settings[opt] = options[opt];
      }
    }
  }

  this.intervalInstance = null;
  this.heartbeatIntervalInstance = null;

  this.lookupData = function () {
    var _this = this;

    if (_this.settings.messageQueue.length > 0) {
      var data = _this.settings.messageQueue[0];

      var index = _this.settings.messageQueue.indexOf(data);
      if (index > -1) {
        _this.settings.messageQueue.splice(index, 1);
      }

      if (typeof _this.settings.ajax.url === 'string' && _this.settings.ajax.url.length > 0) {
        _this.getData(data);
      } else {
        _this.settings.callback(data);
      }
    }
  };

  this.setInterval = function () {
    var _this = this;

    _this.intervalInstance = setInterval(function () {
      _this.lookupData();
    }, _this.settings.messageInterval);

    if (_this.settings.heartbeat !== null) {
      _this.settings.lastHeartbeat = new Date();
      _this.heartbeatIntervalInstance = setInterval(function () {
        var currentTime = new Date();
        var diff = _this.settings.lastHeartbeat.getTime() - currentTime.getTime();

        if (_this.settings.source.readyState === 0 && diff > _this.settings.heartWaitTime) {
          _this.closeChanel();
        }

        _this.hearBeatCheck();
      }, _this.settings.heartWaitTime);
    }
  };

  /**
   * Request a heartbeat
   * - if the request is failing close the connection
   * - if the request is successful but the connection is closed reopen and call for a heartbeat again
   *
   * @memberOf Messaging
   * @return {undefined}
   */
  this.hearBeatCheck = function () {
    var _this = this;

    var dataObj = {
      url: _this.settings.heartbeat,
      headers: _this.settings.ajax.apiKey,
      type: 'GET',
      success: function (response, dataObject, xhr) {
        if (xhr.status !== 200 && _this.settings.source.readyState === 0) {
          if (_this.settings.debug) console.log('[Msg] SSE Closing connection');
          _this.closeChanel();
        } else if (xhr.status === 200 && _this.settings.source.readyState === 2) {
          if (_this.settings.debug) console.log('[Msg] SSE Trying to re-open the connection');
          _this.openChanel();

          setTimeout(function () {
            _this.hearBeatCheck();
          }, 200);
        }
      }
    };

    if (typeof _this.settings.ajax.apiKey !== 'undefined') {
      dataObj.headers = _this.settings.ajax.apiKey;
    }

    _this.settings.heartBeatAjax.abort().getData(dataObj);
  };

  this.getData = function () {
    var _this = this;

    var dataObj = {
      url: _this.settings.ajax.url,
      type: 'GET',
      success: function (response, dataObject, xhr) {
        var json = {};
        try {
          json = JSON.parse(response);
        } catch (e) {
          if (_this.settings.debug) console.log(e, _this.settings);
        }
        if (xhr.status === 200) {
          _this.settings.callback(json);
        } else {
          _this.settings.ajax.errorCallback(json);
        }
      }
    };

    if (typeof _this.settings.ajax.apiKey !== 'undefined') {
      dataObj.headers = _this.settings.ajax.apiKey;
    }

    _this.settings.mainAjax.abort().getData(dataObj);
  };

  this.openChanel = function () {
    var _this = this;

    _this.settings.source = new EventSource(_this.settings.sseUrl, { withCredentials: true });

    _this.serverSideEventListeners(_this.settings.source);
  };

  this.serverSideEventListeners = function (source) {
    var _this = this;

    source.addEventListener('open', function (e) {
      _this.settings.active = true;
      if (_this.settings.debug) console.log('[Msg] connection opened', e);
    }, false);

    source.addEventListener('message', function (e) {
      if (_this.settings.debug) {
        console.log('[Msg] message check', _this.settings.sseUrl);
        console.log(e.data);
      }
      var data = e.data;
      var json = null;

      try {
        json = JSON.parse(data);
      } catch (e) {
      }

      if (_this.settings.heartbeat !== null) {
        _this.settings.lastHeartbeat = new Date();
      }

      if (json !== null && typeof json.heartbeat === 'undefined') {
        _this.settings.messageQueue.push(json);
      }
    }, false);

    source.addEventListener('error', function (e) {
      if (_this.settings.debug) {
        console.log('[Msg] error check', _this.settings.sseUrl);
      }

      /* eslint eqeqeq: "off" */
      if (e.readyState == EventSource.CLOSED) {
        if (_this.settings.debug) console.warn('[Msg] connection closed', e);
      } else {
        if (_this.settings.debug) console.log(e, e.readyState);
      }

      _this.closeChanel();

      _this.settings.startupCheck = false;
    }, false);
  };

  this.closeChanel = function () {
    this.settings.active = false;
    this.settings.source.close();
  };

  this.sseFailed = function () {
    var _this = this;

    _this.settings.heartbeat = null;
    _this.settings.active = false;

    if (_this.heartbeatIntervalInstance !== null) {
      clearInterval(_this.heartbeatIntervalInstance);
    }

    _this.settings.onStartupError(_this.settings);
  };

  this.windowActivity = function () {
    var _this = this;

    (function () {
      var hidden = 'hidden';

      // Standards:
      if (hidden in document) {
        document.addEventListener('visibilitychange', onchange);
      } else if ((hidden = 'mozHidden') in document) {
        document.addEventListener('mozvisibilitychange', onchange);
      } else if ((hidden = 'webkitHidden') in document) {
        document.addEventListener('webkitvisibilitychange', onchange);
      } else if ((hidden = 'msHidden') in document) {
        document.addEventListener('msvisibilitychange', onchange);
      } else if ('onfocusin' in document) { // IE 9 and lower:
        document.onfocusin = document.onfocusout = onchange;
      } else { // All others:
        window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
      }

      function onchange (evt) {
        var status = '';
        var v = 'visible';
        var h = 'hidden';
        var evtMap = {
          focus: v, focusin: v, pageshow: v, blur: h, focusout: h, pagehide: h
        };

        evt = evt || window.event;
        if (evt.type in evtMap) {
          status = evtMap[evt.type];
        } else {
          status = this[hidden] ? 'hidden' : 'visible';
        }

        if (status === 'visible' && (_this.settings.source.readyState !== 0 && _this.settings.source.readyState !== 1)) {
          _this.openChanel();
        } else if (status === 'hidden' && (_this.settings.source.readyState === 0 || _this.settings.source.readyState === 1)) {
          _this.closeChanel();
        }
      }

      // set the initial state (but only if browser supports the Page Visibility API)
      if (document[hidden] !== undefined) {
        onchange({ type: document[hidden] ? 'blur' : 'focus' });
      }
    })();
  };

  this.init = function () {
    var _this = this;

    try {
      if (_this.settings.debug) console.log('[Msg] SSE starting', _this.settings.sseUrl, new Date());

      _this.openChanel();

      if (_this.settings.debug) console.log('[Msg] SSE started', _this.settings.sseUrl, new Date(), _this.settings.source.readyState);

      _this.setInterval();
      _this.windowActivity();

      setTimeout(function () {
        if (!_this.settings.startupCheck) {
          console.log('sse failed');
          _this.sseFailed();
        }
      }, 2000);

      window.addEventListener('unload', function (event) {
        if (_this.settings.debug) console.log('[Msg] closing messaging service', new Date());
        _this.settings.source.close();
        _this.settings.active = false;

        _this.settings.heartBeatAjax.abort();

        if (_this.intervalInstance) {
          clearInterval(_this.intervalInstance);
        }
      });
      window.addEventListener('beforeunload', function (event) {
        if (_this.settings.debug) console.log('[Msg] closing messaging service');
        _this.settings.source.close();

        _this.settings.heartBeatAjax.abort();

        if (_this.intervalInstance) {
          clearInterval(_this.intervalInstance);
        }
      });
    } catch (e) {
      if (_this.settings.debug) console.log('EventSource failed');
      _this.sseFailed();
    }
  };

  this.init();
};
