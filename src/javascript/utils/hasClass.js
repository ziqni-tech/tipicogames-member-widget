/**
 * Provides an ability to check if a DOM element contains a class string
 * @memberOf module:utils
 * @static
 * @param element
 * @param className
 * @returns {boolean}
 */

function _hasClass (element, className) {
  className = className.replace('.', '');

  try {
    if (element.classList) {
      return element.classList.contains(className);
    } else {
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
    }
  } catch (e) {
    if (typeof e.stack !== 'undefined') {
      console.log(e.stack);
    }
    console.log(e, element, className);

    return false;
  }
}

const hasClass = function (element, className) {
  if (typeof className === 'string') {
    return _hasClass(element, className);
  } else if (className instanceof Array) {
    var hasClass = false;
    for (var i in className) {
      if (typeof className[i] === 'string' && _hasClass(element, className[i])) {
        hasClass = true;
      }
    }
    return hasClass;
  }
};

export default hasClass;
