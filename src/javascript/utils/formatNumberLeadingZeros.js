/**
 * Prepends 0 the provided number and returns the formated element as a string
 * @memberOf module:utils
 * @static
 * @param num
 * @param size {number}
 * @returns {string} 1 => 001
 */
const formatNumberLeadingZeros = function (num, size) {
  var s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
};

export default formatNumberLeadingZeros;
