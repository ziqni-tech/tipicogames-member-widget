import cLabs from '../modules/cLabs';
import hasClass from './hasClass';

/**
 * Iterate up the tree of DOM elements to find the closes match
 * @memberOf module:utils
 * @static
 * @param element
 * @param selector
 * @returns {null | ParentNode}
 */
const closest = function (element, selector) {
  if (typeof selector === 'object') {
    var selectorClassString = selector.getAttribute('class');
    var selectorIdString = selector.id;

    if (selectorIdString !== null && selectorIdString.length > 0) {
      selector = '#' + selectorIdString;
    } else if (selectorClassString !== null && selectorClassString.length > 0) {
      selector = '.' + selectorClassString.split(' ')[0];
    } else {
      selector = selector.nodeName;
    }
  }

  function closest (element, selector) {
    try {
      element = element.parentNode;
    } catch (e) {
      console.log(element, selector);
      console.trace();
    }

    if (element !== null && typeof element === 'object') {
      if (selector.match(cLabs.classSelector) && hasClass(element, selector)) {
        return element;
      } else if (selector.match(cLabs.idSelector) && element.id === selector.replace('#', '')) {
        return element;
      } else if (selector.match(cLabs.tagSelector) && element.nodeName === selector.toUpperCase()) {
        return element;
      } else {
        return closest(element, selector);
      }
    } else {
      return null;
    }
  }

  if (typeof element === 'object') {
    return closest(element, selector);
  } else {
    return null;
  }
};

export default closest;
