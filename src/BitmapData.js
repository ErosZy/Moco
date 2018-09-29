import Matrix3 from "./Matrix3";

class BitmapData {
  constructor(width, height) {
    let canvas = wx.createCanvas();
    canvas.width = width;
    canvas.height = height;

    this._source = canvas;
    this._ctx = canvas.getContext("2d");
    this._matrix = Matrix3.identity();
    this._locked = false;
    this._imageData = null;
    this.width = width || 0;
    this.height = height || 0;
  }

  clone() {
    let bmd = new BitmapData(this.width, this.height);
    bmd.draw(this._source, this._matrix);
    return bmd;
  }

  dispose() {
    this._source = null;
    this._matrix = Matrix3.identity();
    this._locked = false;
    this.width = 0;
    this.height = 0;
  }

  draw(source, matrix) {
    if (this._locked) {
      return;
    }

    this.width = source.width;
    this.height = source.height;
    this._ctx.drawImage(source, 0, 0);
    this._imageData = null;
    this._locked = false;

    if (matrix instanceof Matrix3) {
      this._matrix.multi(matrix);
    }
  }

  getPixel(x, y) {
    if (!this._ctx || x > this.width || y > this.height) {
      return new ImageData(new Uint8ClampedArray(new Array(4), 0, 4), 1, 1); // jshint ignore:line
    }

    let imageData = null;
    let data = null;
    if (this._locked) {
      let index = (x * this.width + this.height) * 4;
      imageData = this._imageData;
      data = imageData.data;
      return new ImageData(
        new Uint8ClampedArray(
          [data[index], data[index + 1], data[index + 2], data[index + 3]],
          0,
          4
        ),
        1,
        1
      ); // jshint ignore:line
    } else {
      imageData = this._ctx.getImageData(x, y, 1, 1);
      data = imageData.data;
      return new ImageData(
        new Uint8ClampedArray([data[0], data[1], data[2], 0], 0, 4),
        1,
        1
      ); // jshint ignore:line
    }
  }

  getPixel32(x, y) {
    if (!this._ctx || x > this.width || y > this.height) {
      return new ImageData(new Uint8ClampedArray([0, 0, 0, 0], 0, 4), 1, 1); // jshint ignore:line
    }

    if (this._locked) {
      let imageData = this._imageData;
      let data = imageData.data;
      let index = (x * this.width + this.height) * 4;
      return new ImageData(
        new Uint8ClampedArray(
          [data[index], data[index + 1], data[index + 2], data[index + 3]],
          0,
          4
        ),
        1,
        1
      ); // jshint ignore:line
    } else {
      return this._ctx.getImageData(x, y, 1, 1);
    }
  }

  getPixels(x, y, width, height) {
    if (!this._ctx || x > this.width || y > this.height) {
      return new ImageData(new Uint8ClampedArray([0, 0, 0, 0], 0, 4), 1, 1); // jshint ignore:line
    }

    width = x + width > this.width ? this.width - x : width;
    height = y + height > this.height ? this.height - y : height;

    if (this._locked) {
      let imageData = this._imageData;
      let data = imageData.data;
      let tmp = [];
      for (let i = 0; i < height; i += 1) {
        let startIndex = (y + i) * this.height + x;
        for (let j = 0; j < width; j += 1) {
          let index = (startIndex + j) * 4;
          tmp.push(
            data[index],
            data[index + 1],
            data[index + 2],
            data[index + 3]
          );
        }
      }
      return new ImageData(
        new Uint8ClampedArray(tmp, 0, tmp.length),
        width,
        height
      ); // jshint ignore:line
    } else {
      return this._ctx.getImageData(x, y, width, height);
    }
  }

  setPixel(x, y, imageData) {
    let _ctx = this._ctx;
    if (!_ctx || !imageData) {
      return;
    }

    if (this._locked) {
      let index = (x * this.width + y) * 4;
      let data = this._imageData.data;
      data[index] = imageData.data[0];
      data[index + 1] = imageData.data[1];
      data[index + 2] = imageData.data[2];
    } else {
      let tmp = this.getPixels(x, y, 1, 1);
      tmp.data[0] = imageData.data[0];
      tmp.data[1] = imageData.data[1];
      tmp.data[2] = imageData.data[2];
      _ctx.putImageData(tmp, x, y, 0, 0, 1, 1);
    }
  }

  setPixel32(x, y, imageData) {
    let _ctx = this._ctx;
    if (!_ctx || !imageData) {
      return;
    }

    if (this._locked) {
      let index = (x * this.width + y) * 4;
      let data = this._imageData.data;
      data[index] = imageData.data[0];
      data[index + 1] = imageData.data[1];
      data[index + 2] = imageData.data[2];
      data[index + 3] = imageData.data[3];
    } else {
      let tmp = this.getPixels(x, y, 1, 1);
      tmp.data[0] = imageData.data[0];
      tmp.data[1] = imageData.data[1];
      tmp.data[2] = imageData.data[2];
      tmp.data[3] = imageData.data[3];
      _ctx.putImageData(tmp, x, y, 0, 0, 1, 1);
    }
  }

  setPixels(x, y, width, height, imageData) {
    let _ctx = this._ctx;
    if (!_ctx || x > this.width || y > this.height || !imageData) {
      return;
    }

    width = x + width > this.width ? this.width - x : width;
    height = y + height > this.height ? this.height - y : height;

    if (this._locked) {
      let data = this._imageData.data;
      for (let i = 0; i < height; i += 1) {
        let startIndex = (y + i) * this.height + x;
        for (let j = 0; j < width; j += 1) {
          let index = (i * height + j) * 4;
          for (let m = 0; m < 4; m += 1) {
            data[(startIndex + j) * 4 + m] = imageData.data[index + m];
          }
        }
      }
    } else {
      let tmp = this.getPixels(x, y, width, height);
      for (let i = 0; i < height; i += 1) {
        for (let j = 0; j < width; j += 1) {
          let index = (i * height + j) * 4;
          for (let m = 0; m < 4; m += 1) {
            tmp.data[index + m] = imageData.data[index + m];
          }
        }
      }

      _ctx.putImageData(tmp, x, y, 0, 0, width, height);
    }
  }

  lock() {
    this._locked = true;
    this._imageData = this._ctx.getImageData(0, 0, this.width, this.height);
  }

  unlock() {
    this._locked = false;
    if (this._imageData) {
      this._ctx.putImageData(this._imageData, 0, 0);
    }
    this._imageData = null;
  }
}

module.exports = BitmapData;
