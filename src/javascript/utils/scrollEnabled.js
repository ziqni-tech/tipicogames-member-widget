/**
 * Check if scrolling is enabled
 * @memberOf module:utils
 * @static
 * @param doc
 * @returns {boolean}
 */
const scrollEnabled = function (doc) {
  return (doc !== null) ? (doc.scrollHeight > doc.offsetHeight) : false;
};

export default scrollEnabled;
