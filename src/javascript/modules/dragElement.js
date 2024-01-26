import { addClass, hasClass, isiOSDevice, isMobileTablet, removeClass } from '../utils';

// var scrollObj2 = null;
let movementInterval;

const dragElement = function (elmnt, draggableEl, overlayContainer, container, dragging, finishDragging, mobileTouch) {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;
  const isMobile = isMobileTablet();
  const isiOS = isiOSDevice();
  const isParentWindow = elmnt.parentNode.nodeName === 'BODY';
  let maxLeft = (isParentWindow ? window.innerWidth : container.offsetWidth);
  let maxTop = (isParentWindow ? window.innerHeight : container.offsetHeight);
  let touchStart;
  let moving = null;
  // scrollObj2 = query(".scroll-res");

  if (movementInterval) {
    clearTimeout(movementInterval);
  }

  var onWindowChange = function () {
    var isVertical = hasClass(elmnt, 'cl-vertical-mini');
    var maxLeft = (isParentWindow ? window.innerWidth : container.offsetWidth);
    var maxTop = (isParentWindow ? window.innerHeight : container.offsetHeight);
    var offsetMaxLeft = maxLeft - parseInt(elmnt.offsetWidth + (isVertical ? draggableEl.offsetWidth / 7 : draggableEl.offsetWidth / 1.6));
    var offsetMaxTop = maxTop - parseInt(elmnt.offsetHeight + (isVertical ? draggableEl.offsetHeight / 1.2 : draggableEl.offsetHeight / 4));
    var elTop = parseInt(elmnt.style.top);
    var elLeft = parseInt(elmnt.style.left);

    if (elTop > offsetMaxTop && offsetMaxTop > 5) {
      elmnt.style.top = offsetMaxTop + 'px';
    }
    if (elLeft > offsetMaxLeft && offsetMaxLeft > 5) {
      elmnt.style.left = offsetMaxLeft + 'px';
    }
  };

  if (isMobile) {
    /* listen to the touchMove event,
      every time it fires, grab the location
      of touch and assign it to box */

    var justATouch = false;
    draggableEl.addEventListener('touchstart', function (e) {
      justATouch = true;

      if (touchStart) clearTimeout(touchStart);

      maxLeft = (isParentWindow ? window.innerWidth : container.offsetWidth);
      maxTop = (isParentWindow ? window.innerHeight : container.offsetHeight);

      touchStart = setTimeout(function () {
        justATouch = false;
      }, 300);
    }, { passive: isiOS });

    draggableEl.addEventListener('touchmove', function (e) {
      e.preventDefault();
      pos3 = e.targetTouches[0].clientX;
      pos4 = e.targetTouches[0].clientY;
      // moving = new Date().getTime();

      elementDrag(e);
    }, { passive: isiOS });

    draggableEl.addEventListener('touchend', function (e) {
      // e.preventDefault();
      // current box position.
      closeDragElement(e);
      moving = null;

      if (justATouch && typeof mobileTouch === 'function') {
        mobileTouch();
      }
    }, { passive: isiOS });

    window.addEventListener('orientationchange', function (e) {
      onWindowChange();
    }, true);
  } else {
    // if present, the header is where you move the DIV from:
    draggableEl.onmousedown = dragMouseDown;

    window.addEventListener('resize', function (e) {
      onWindowChange();
    }, true);
  }

  function dragMouseDown (e) {
    e = e || window.event;
    e.preventDefault();

    maxLeft = (isParentWindow ? window.innerWidth : container.offsetWidth);
    maxTop = (isParentWindow ? window.innerHeight : container.offsetHeight);

    overlayContainer.style.display = 'block';

    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  /**
   * Adds additional offset to max left and top based on orientation and container width (will be affected by CSS styling so needs to be adjusted accordingly)
   * - elmnt => is the main container that has the positioning applied to
   * - draggableEl => key element that is mean for dragging
   */
  var checkMaxMinRestraints = function (newTop, newLeft, offsetMaxLeft, offsetMaxTop, isVertical) {
    var minLeft = isVertical ? 15 : 0;
    var top = (newTop <= 0 ? 0 : newTop);
    var left = (newLeft <= minLeft ? minLeft : newLeft);

    if (left >= offsetMaxLeft) {
      left = offsetMaxLeft;
    }
    if (top >= offsetMaxTop) {
      top = offsetMaxTop;
    }

    return {
      top: top,
      left: left
    };
  };

  function elementDrag (e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    var posX = (isMobile) ? e.targetTouches[0].clientX : e.clientX;
    var posY = (isMobile) ? e.targetTouches[0].clientY : e.clientY;
    var isVertical = hasClass(elmnt, 'cl-vertical-mini');
    var offsetMaxLeft = maxLeft - parseInt(elmnt.offsetWidth + (isVertical ? draggableEl.offsetWidth / 7 : draggableEl.offsetWidth / 1.6));
    var offsetMaxTop = maxTop - parseInt(elmnt.offsetHeight + (isVertical ? draggableEl.offsetHeight / 1.2 : draggableEl.offsetHeight / 4));

    pos1 = pos3 - posX;
    pos2 = pos4 - posY;
    pos3 = parseInt(posX);
    pos4 = parseInt(posY);
    moving = new Date().getTime();

    checkMovement();

    if (!hasClass(elmnt, 'cl-being-moved')) addClass(elmnt, 'cl-being-moved');

    const containerRect = container.getBoundingClientRect();

    const newTop = (isMobile) ? (posY - containerRect.top - 20) : (elmnt.offsetTop - pos2);
    const newLeft = (isMobile) ? (posX - containerRect.left - 25) : (elmnt.offsetLeft - pos1);
    var leftTopCheck = checkMaxMinRestraints(newTop, newLeft, offsetMaxLeft, offsetMaxTop, isVertical);

    elmnt.style.top = leftTopCheck.top + 'px';
    elmnt.style.left = leftTopCheck.left + 'px';

    if (typeof dragging === 'function') dragging(newTop, newLeft);
  }

  function closeDragElement (e) {
    overlayContainer.style.display = 'none';
    if (isMobile) {
      e.preventDefault();
    } else {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
    moving = null;

    removeClass(elmnt, 'cl-being-moved');

    if (typeof finishDragging === 'function') finishDragging();
  }

  function checkMovement () {
    if (movementInterval) {
      clearTimeout(movementInterval);
    }

    movementInterval = setTimeout(function () {
      if (moving !== null && moving + 3000 < new Date().getTime() && !isMobile) {
        closeDragElement();
      } else if (moving !== null) {
        checkMovement();
      }
    }, 3000);
  }
};

export default dragElement;
