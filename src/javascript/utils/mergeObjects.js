import sizeof from './sizeof';

const mergeObjects = function (obj1, obj2, arrayType) {
  var obj3 = (typeof arrayType === 'undefined' || arrayType === false) ? {} : [];

  for (const i in obj1) {
    obj3[i] = obj1[i];
  }

  for (const k in obj2) {
    if (typeof obj1[k] !== 'object') {
      obj3[k] = obj2[k];
    } else if (obj1[k] instanceof Array) {
      obj3[k] = obj2[k]; // arrays get overwritten and not extended
    } else if (typeof obj1[k] !== 'undefined' && typeof obj1[k] === 'object' && obj1[k] !== null && typeof obj1[k].nodeType === 'undefined' && sizeof(obj1[k]) > 0) {
      obj3[k] = mergeObjects(obj1[k], obj2[k]);
    } else if (typeof obj1[k] !== 'undefined' && typeof obj1[k] === 'object') {
      obj3[k] = obj2[k];
    } else {
      console.log('fail');
    }

    if (obj3[k] === undefined) {
      delete obj3[k];
    }
  }

  return obj3;
};

export default mergeObjects;
