const mapObject = function (obj, callback) {
  if (obj !== null) {
    var count = 0;
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var ret = callback(obj[key], key, count);
        if (typeof ret !== 'undefined') obj[key] = ret;

        count++;
      }
    }
  } else {
    console.log('returned object is null', typeof obj);
  }

  return obj;
};

export default mapObject;
