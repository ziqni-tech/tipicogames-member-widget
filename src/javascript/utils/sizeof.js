import isElement from './isElement';

/**
 * returns the size of an Object or array
 *
 * @memberOf module:utils
 * @static
 * @param obj {Object}
 * @return {Number}
 */
const sizeof = function (obj) {
  let size = 0; let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }

  if (size === 0 && isElement(obj)) {
    size = 1;
  }

  return size;
};

export default sizeof;
