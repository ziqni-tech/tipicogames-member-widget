const appendNext = function (el, newNode) {
  if (el.nextSibling) {
    el.parentNode.insertBefore(newNode, el.nextSibling);
  } else {
    el.parentNode.appendChild(newNode);
  }
};

export default appendNext;
