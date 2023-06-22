/**
 * App/Append new class string to the provided DOM element
 * @memberOf module:utils
 * @static
 * @param element
 * @param className
 * @returns {{classList}|*}
 */
const addClass = function (element, className) {
  try {
    if (element.classList) {
      element.classList.add(className);
    } else {
      element.className += ' ' + className;
    }
  } catch (e) {
    console.trace();
  }

  return element;
};

export default addClass;
