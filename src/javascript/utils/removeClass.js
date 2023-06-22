/**
 * Remove class string from provided DOM element
 * @memberOf module:utils
 * @static
 * @param element
 * @param className
 * @returns {{classList}|*}
 */
const removeClass = function (element, className) {
  try {
    if (element.classList) {
      element.classList.remove(className);
    } else {
      element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  } catch (e) {
    console.log(element, className);
    // console.error(e);
    // console.trace();
  }

  return element;
};

export default removeClass;
