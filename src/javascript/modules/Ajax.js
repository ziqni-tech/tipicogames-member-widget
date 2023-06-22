import cLabs from './cLabs';
import sizeof from '../utils/sizeof';

/**
 * Ajax method
 *
 * @constructor
 */
cLabs.Ajax = function () {
  this.xhr = new XMLHttpRequest();
};

cLabs.Ajax.prototype.createCORSRequest = function (method, url) {
  var obj = this;

  if ('withCredentials' in obj.xhr) {
    // Most browsers.
    obj.xhr.open(method, url, true);
  } else if (typeof XDomainRequest !== 'undefined') {
    // IE8 & IE9
    /* eslint no-undef: "off" */
    obj.xhr = new XDomainRequest();

    url = (url.indexOf('https') > -1 && location.protocol !== 'https:') ? url.replace('https', 'http') : url;

    obj.xhr.open(method, url);
  } else {
    // CORS not supported.
    obj.xhr = null;
  }
  return obj.xhr;
};

/**
 * Abort the request if it has already been sent
 *
 * @memberOf cLabs.Ajax
 * @method abort
 * @return { Object } cLabs.Ajax
 */
cLabs.Ajax.prototype.abort = function () {
  var _this = this;

  if (_this.xhr && typeof _this.xhr.readyState !== 'undefined' && _this.xhr.readyState !== 4 && _this.xhr.readyState > 0) {
    // console.error("aborting Ajax", _this.xhr.readyState, _this.xhr);
    _this.xhr.abort();
  }

  return _this;
};

/**
 * Retrieves data from a URL without page refresh
 *
 * @memberOf cLabs.Ajax
 * @method getData
 * @param {Object} configuration object
 *  - object contains: HTTP method "type: POST, GET", url: to send the request to, data: {object}
 * @return {String} in success object
 */
cLabs.Ajax.prototype.getData = function (data) {
  var obj = this;

  try {
    data.type = (data.type !== undefined && typeof data.type === 'string' && data.type.length > 0) ? data.type : 'POST';
    data.data = (data.data !== undefined && typeof data.data === 'object') ? data.data : {};
    data.url = (data.url !== undefined && typeof data.url === 'string' && data.url.length > 0) ? data.url : '';
    data.success = (data.success !== undefined) ? data.success : function () {
    };
    data.error = (data.error !== undefined) ? data.error : function () {
    };
    data.headers = (data.headers !== undefined) ? data.headers : {};
    data.extraCallback = (data.extraCallback !== undefined) ? data.extraCallback : function () {
    };

    // cross browser CORS support
    obj.xhr = this.createCORSRequest(data.type, data.url);

    obj.xhr.onload = function () {
      data.extraCallback(data, obj.xhr);
      data.success(obj.xhr.responseText, data, obj.xhr);
    };

    obj.xhr.onerror = function () {
      data.error(obj.xhr.status);
    };

    if (typeof XDomainRequest === 'undefined') {
      if (sizeof(data.headers) > 0) {
        var item;
        for (item in data.headers) {
          obj.xhr.setRequestHeader(item, data.headers[item]);
        }
      } else if ((data.type === 'POST' || data.type === 'PUT') && sizeof(data.headers) === 0) {
        obj.xhr.setRequestHeader('Content-Type', 'application/json');
      } else {
        obj.xhr.setRequestHeader('Content-Type', 'text/plain');
      }
    }

    obj.xhr.send(JSON.stringify(data.data));

    return obj.xhr;
  } catch (err) {
    console.log(err);
  }
};
