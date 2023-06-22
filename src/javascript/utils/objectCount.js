/**
 * Returns a count of object from a query result
 * @memberOf module:utils
 * @static
 * @paramobj  {Object} anything or Array object
 */
const objectCount = function (obj) {
  if (obj !== null && obj.length !== undefined && obj instanceof Array) {
    return obj.length;
  } else if (obj !== null) {
    return 1;
  } else {
    return 0;
  }
};

export default objectCount;
