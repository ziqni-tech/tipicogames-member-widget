import './polyfills';
import './modules/setTimeoutGlobal';
import { LbWidget } from './modules/LbWidget';

if (process.env.INLINE_CSS) {
  require('../scss/' + process.env.THEME + '/style.scss');
}

(function () {
  if (typeof window._CLLBV3Opt === 'undefined') {
    window._CLLBV3Opt = {
      autoStart: false
    };
  }

  if (typeof window._clLeaderBoardV3 === 'undefined') {
    window._clLeaderBoardV3 = new LbWidget(window._CLLBV3Opt);
  } else {
    console.warn('window._clLeaderBoardV3 is already defined, widget is configured to run as a single instance');
  }
})();
