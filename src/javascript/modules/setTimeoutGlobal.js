// global timeout handling
import mapObject from '../utils/mapObject';

try {
  if (typeof setTimeoutGlobal !== 'function') {
    window._setTimeoutGlobalRepository = [];
    window.setTimeoutGlobal = function (id, func, timer) {
      var exists = false;
      mapObject(window._setTimeoutGlobalRepository, function (instance, key, count) {
        if (id === instance.id) {
          exists = true;
        }
      });

      if (!exists) {
        var interval = setTimeout(function () {
          mapObject(window._setTimeoutGlobalRepository, function (instance, key, count) {
            if (id === instance.id) {
              window._setTimeoutGlobalRepository.splice(key, 1);
            }
          });

          if (typeof func === 'function') {
            func();
          }
        }, timer);

        window._setTimeoutGlobalRepository.push({
          id: id,
          func: func,
          timer: timer,
          interval: interval
        });

        return interval;
      } else {
        throw new Error('setTimeoutGlobal - ID [' + id + '] already in use');
      }
    };

    var closeTimeout = function () {
      if (window._setTimeoutGlobalRepository.length > 0) {
        mapObject(window._setTimeoutGlobalRepository, function (instance, key, count) {
          if (instance.interval) {
            clearInterval(instance.interval);
            instance.interval = null;
          }
        });
      }
    };

    var reEnableTimeouts = function () {
      if (window._setTimeoutGlobalRepository.length > 0) {
        var tmp = [];
        mapObject(window._setTimeoutGlobalRepository, function (instance, key, count) {
          tmp.push(instance);
        });

        window._setTimeoutGlobalRepository = [];
        mapObject(tmp, function (instance, key, count) {
          window.setTimeoutGlobal(instance.id, instance.func, instance.timer);
        });
      }
    };

    var windowActivity = function () {
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

          if (status === 'visible') {
            reEnableTimeouts();
          } else if (status === 'hidden') {
            closeTimeout();
          }
        }

        // set the initial state (but only if browser supports the Page Visibility API)
        if (document[hidden] !== undefined) {
          onchange({ type: document[hidden] ? 'blur' : 'focus' });
        }
      })();
    };

    windowActivity();
  }
} catch (err) {
  console.log(err);
}
