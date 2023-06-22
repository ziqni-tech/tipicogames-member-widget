import './polyfills';
import './modules/setTimeoutGlobal';
import { LbWidget } from './modules/LbWidget';

if (process.env.INLINE_CSS) {
  require('../scss/' + process.env.THEME + '/style.scss');
}

(function () {
  if (typeof window._clLeaderBoardV3SelfInit === 'undefined') {
    window._clLeaderBoardV3SelfInit = LbWidget;
  } else {
    console.warn('window._clLeaderBoardV3SelfInit is already defined');
  }
})();
