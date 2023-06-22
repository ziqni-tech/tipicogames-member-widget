import mapObject from '../utils/mapObject';
import removeClass from '../utils/removeClass';
import query from '../utils/query';
import stripHtml from '../utils/stripHtml';
import addClass from '../utils/addClass';

/**
 * Notifications leaderboard widget
 * @param options {Object}
 * @constructor
 */
export const Notifications = function (options) {
  /**
   * Notifications settings
   * @memberOf Notifications
   * @constant
   * @type { Object }
   */
  this.settings = {
    container: null,
    detailsContainer: null,
    canvasInstance: null,
    lbWidget: null,
    eventStream: [],
    checkTimeout: 2000,
    onDisplayCheckTimeout: 10000,
    checkInterval: null,
    autoNotificationHideInterval: null,
    autoNotificationHideTime: 10000,
    displayInProgress: false,
    dataExtractionForCanvas: function (data, callback) {
      if (typeof data.metadata !== 'undefined' && data.metadata.length > 0 && typeof callback === 'function') {
        let found = false;
        mapObject(data.metadata, function (meta) {
          if (meta.key === 'webAsset' && !found) {
            const responseObj = {
              imageSrc: meta.value
            };
            found = true;
            console.log(responseObj);
            callback(responseObj);
          }
        });
      }
    }
  };

  if (typeof options !== 'undefined') {
    for (var opt in options) {
      if (options.hasOwnProperty(opt)) {
        this.settings[opt] = options[opt];
      }
    }
  }

  this.layoutWrapper = function () {
    const wrapper = document.createElement('div');
    const iconWrapper = document.createElement('div');
    const icon = document.createElement('div');
    const informationWrapper = document.createElement('div');
    const informationTopWrapper = document.createElement('div');
    const informationDetailsContainer = document.createElement('div');
    const informationDetailsLabel = document.createElement('div');
    const informationDetailsDescription = document.createElement('div');
    const informationWrapperClose = document.createElement('div');
    const informationClose = document.createElement('a');

    wrapper.setAttribute('class', 'cl-widget-notif-wrapper');
    iconWrapper.setAttribute('class', 'cl-widget-notif-icon-wrapper');
    icon.setAttribute('class', 'cl-widget-notif-icon');
    informationTopWrapper.setAttribute('class', 'cl-widget-notif-information-top-wrapper');
    informationWrapper.setAttribute('class', 'cl-widget-notif-information-wrapper');
    informationDetailsContainer.setAttribute('class', 'cl-widget-notif-information-details-wrapper');
    informationDetailsLabel.setAttribute('class', 'cl-widget-notif-information-details-label');
    informationDetailsDescription.setAttribute('class', 'cl-widget-notif-information-details-description');
    informationWrapperClose.setAttribute('class', 'cl-widget-notif-information-close-wrapper');
    informationClose.setAttribute('class', 'cl-widget-notif-information-close');

    informationClose.href = 'javascript:void(0);';
    informationClose.innerHTML = 'x';

    informationDetailsContainer.appendChild(informationDetailsLabel);
    informationDetailsContainer.appendChild(informationDetailsDescription);

    informationWrapperClose.appendChild(informationClose);
    informationWrapper.appendChild(informationWrapperClose);
    informationWrapper.appendChild(informationDetailsContainer);
    informationTopWrapper.appendChild(informationWrapper);
    iconWrapper.appendChild(icon);
    wrapper.appendChild(iconWrapper);
    wrapper.appendChild(informationTopWrapper);

    return wrapper;
  };

  this.autoNotificationHide = function () {
    const _this = this;

    if (_this.settings.autoNotificationHideInterval) {
      clearTimeout(_this.settings.autoNotificationHideInterval);
    }

    _this.settings.autoNotificationHideInterval = setTimeout(function () {
      _this.hideNotification();
    }, _this.settings.autoNotificationHideTime);
  };

  this.hideNotification = function () {
    const _this = this;

    if (_this.settings.autoNotificationHideInterval) {
      clearTimeout(_this.settings.autoNotificationHideInterval);
    }

    removeClass(query(_this.settings.container, '.cl-widget-notif-information-wrapper'), 'cl-show');
    setTimeout(function () {
      _this.settings.container.style.display = 'none';
      _this.settings.displayInProgress = false;
    }, 200);
  };

  this.showNotification = function (data) {
    const _this = this;
    const label = query(_this.settings.detailsContainer, '.cl-widget-notif-information-details-label');
    const description = query(_this.settings.detailsContainer, '.cl-widget-notif-information-details-description');
    const descriptionText = stripHtml(data.body);

    label.innerHTML = (data.subject.length > 23) ? data.subject.substr(0, 23) + '...' : data.subject;
    description.innerHTML = (descriptionText.length > 60) ? descriptionText.substr(0, 60) + '...' : descriptionText;

    _this.settings.detailsContainer.dataset.id = data.id;

    _this.settings.container.style.display = 'block';
    setTimeout(function () {
      addClass(query(_this.settings.container, '.cl-widget-notif-information-wrapper'), 'cl-show');
    }, 200);

    if (_this.settings.canvasInstance !== null) {
      _this.handleCanvasAnimations(data);
    }

    _this.autoNotificationHide();
  };

  this.handleCanvasAnimations = function (data) {
    const _this = this;

    _this.settings.dataExtractionForCanvas(data, function (canvasData) {
      if (canvasData.imageSrc.length > 0) {
        _this.settings.canvasInstance.settings.imageSrc = canvasData.imageSrc;
        _this.settings.canvasInstance.init();
      }
    });
  };

  this.addEvent = function (data) {
    this.settings.eventStream.push(data);
  };

  this.eventStreamCheck = function () {
    const _this = this;

    if (_this.settings.checkInterval) {
      clearTimeout(_this.settings.checkInterval);
    }

    if (_this.settings.eventStream.length > 0 && !_this.settings.displayInProgress) {
      _this.settings.displayInProgress = true;

      const data = _this.settings.eventStream[0];
      const index = _this.settings.eventStream.indexOf(data);

      _this.showNotification(data);

      _this.settings.checkInterval = setTimeout(function () {
        _this.eventStreamCheck();
      }, _this.settings.onDisplayCheckTimeout);

      _this.settings.eventStream.splice(index, 1);
    } else {
      _this.settings.checkInterval = setTimeout(function () {
        _this.eventStreamCheck();
      }, _this.settings.checkTimeout);
    }
  };

  this.init = function () {
    const _this = this;

    if (_this.settings.container === null) {
      _this.settings.container = _this.settings.lbWidget.settings.bindContainer.appendChild(_this.layoutWrapper());
      _this.settings.detailsContainer = query(_this.settings.container, '.cl-widget-notif-information-details-wrapper');
    }

    _this.eventStreamCheck();
  };
};
