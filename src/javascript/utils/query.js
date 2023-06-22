import cLabs from '../modules/cLabs';
import trim from './trim';

/**
 * Query selector, supports CSS element selection
 *
 * Supports:
 *  - Class selection: ".element"
 *  - ID selection: "#element"
 *  - Tag selection: "div"
 *  - Multi depth selection: '.element ul li'
 *
 * @memberOf module:utils
 * @static
 * @param {Object} "optional"
 * @param {String} CSS element selector
 * @returns {(Object|null|Array)} depending on the provided selector results can vary (null, node, NodeList array)
 */
const query = function (doc, selector) {
  var result;

  var tmpDoc = doc; var tmpSelector = selector; // used for debug only

  if (typeof doc === 'string' && selector === undefined) {
    selector = doc;
    doc = document;
  }

  try {
    if (doc !== null) {
      selector = trim(selector); //

      if (selector.match(cLabs.classSelector)) {
        result = doc.getElementsByClassName(selector.replace('.', ''));
      } else if (selector.match(cLabs.idSelector)) {
        result = document.getElementById(selector.replace('#', ''));
      } else if (selector.match(cLabs.tagSelector)) {
        result = doc.getElementsByTagName(selector);
      } else {
        result = doc.querySelectorAll(selector);
      }
    }

    if (result !== null && result !== undefined && result.nodeType) {
      return result;
    } else if (result !== null && result !== undefined && result.length === 1) {
      return result[0];
    } else if (result !== null && result !== undefined && result.length > 0) {
      return Array.prototype.slice.call(result);
    } else {
      return null;
    }
  } catch (e) {
    console.log(e);
    console.log(tmpSelector);
    console.log(tmpDoc);
    console.log(doc, selector);
  }
};

export default query;
