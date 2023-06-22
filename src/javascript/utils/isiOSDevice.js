// check if iOS
const isiOSDevice = function () {
  return !!navigator.platform && /iP(ad|hone|od)/.test(navigator.platform);
};

export default isiOSDevice;
