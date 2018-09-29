class Util {
  static isType(target, type) {
    return Object.prototype.toString.call(target) === "[object " + type + "]";
  }

  static each(arr, callback) {
    if (this.isType(arr, "Array") && Array.prototype.forEach) {
      Array.prototype.forEach.call(arr, callback);
    } else if (this.isType(arr, "Array")) {
      for (let i = 0, len = arr.length; i < len; i += 1) {
        callback(arr[i], i, arr);
      }
    } else if (this.isType(arr, "Object")) {
      for (let key in arr) {
        if (arr.hasOwnProperty(key)) {
          callback(arr[key], key, arr);
        }
      }
    }
  }

  static filter(arr, callback) {
    if (this.isType(arr, "Array") && Array.prototype.filter) {
      return Array.prototype.filter.call(arr, callback);
    } else {
      let tmp = [];
      this.each(arr, (item, index, arr) => {
        if (callback.call(arr, item, index, arr) === true) {
          tmp.push(item);
        }
      });
      return tmp;
    }
  }

  static map(arr, callback) {
    if (this.isType(arr, "Array") && Array.prototype.map) {
      return Array.prototype.map.call(arr, callback);
    } else {
      let tmp = [];
      this.each(arr, (item, index, arr) => {
        tmp.push(callback.call(arr, item, index, arr));
      });
      return tmp;
    }
  }

  static some(arr, callback) {
    if (this.isType(arr, "Array") && Array.prototype.some) {
      return Array.prototype.some.call(arr, callback);
    } else {
      let bol = false;
      this.each(arr, (item, index, arr) => {
        if (callback.call(arr, item, index, arr) === true) {
          bol = true;
        }
      });
      return bol;
    }
  }

  static every(arr, callback) {
    if (this.isType(arr, "Array") && Array.prototype.some) {
      return Array.prototype.some.call(arr, callback);
    } else {
      let bol = true;
      this.each(arr, (item, index, arr) => {
        if (!callback.call(arr, item, index, arr)) {
          bol = false;
        }
      });
      return bol;
    }
  }

  static deg2rad(deg) {
    return (deg * Math.PI) / 180;
  }

  static rad2deg(rad) {
    return (rad / Math.PI) * 180;
  }

  static keys(obj) {
    let keys = [];
    if (obj) {
      if (Object.keys) {
        return Object.keys(obj);
      } else {
        for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
            keys.push(key);
          }
        }
      }
    }
    return keys;
  }

  static inArray(item, arr, fn) {
    for (let i = 0, len = arr.length; i < len; i += 1) {
      if (typeof fn === "function") {
        if (fn.call(item, item, arr[i], i, arr)) {
          return i;
        }
      } else if (arr[i] === item) {
        return i;
      }
    }
    return -1;
  }

  static extends(obj) {
    if (!this.isType(obj, "Object")) {
      return obj;
    }

    for (let i = 1, length = arguments.length; i < length; i += 1) {
      let source = arguments[i];
      for (let prop in source) {
        if (source.hasOwnProperty(prop)) {
          obj[prop] = source[prop];
        }
      }
    }

    return obj;
  }

  static toArray(argv) {
    if (argv && argv.length && argv[0]) {
      return Array.prototype.slice.call(argv, 0, argv.length);
    } else {
      return [];
    }
  }

  static clone(obj) {
    if (typeof obj !== "object") {
      return obj;
    }
    return this.isType(obj, "Array")
      ? Array.prototype.slice.call(obj)
      : this.extends({}, obj);
  }

  // ray-casting algorithm
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  static pip(point, vs) {
    let isInside = false;
    let x = point[0],
      y = point[1];
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i, i += 1) {
      let xi = vs[i][0],
        yi = vs[i][1];
      let xj = vs[j][0],
        yj = vs[j][1];

      let intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) {
        isInside = !isInside;
      }
    }
    return isInside;
  }
}

module.exports = Util;
