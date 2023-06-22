/**
 * Removes an HTML DOM element
 * @memberOf module:utils
 * @static
 * @paramobj el {Object} DOM element
 */
const remove = function (el) {
  if (el !== null) {
    el.parentElement.removeChild(el);
  }
};

export default remove;
