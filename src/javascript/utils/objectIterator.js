/**
 * Object iterator - best usage is for a list of DOM elements
 * @memberOf module:utils
 * @static
 * @param obj
 * @param callback
 */
const objectIterator = function (obj, callback) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj.length !== 'undefined' && obj instanceof Array) {
    let count = 0;
    for (const key in obj) {
      callback(obj[key], key, count, obj.length);

      count++;
    }
  } else if (typeof obj !== 'undefined' && obj !== null) {
    callback(obj, 0, 0, 1);
  }
};

export default objectIterator;
