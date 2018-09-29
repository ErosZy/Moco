import DisplayObjectContainer from "./DisplayObjectContainer";
import LoaderEvent from "./LoaderEvent";
import Util from "./Util";
import BitmapData from "./BitmapData";

class Loader extends DisplayObjectContainer {
  constructor() {
    super();
    this.content = wx.createImage();
    this._close = false;
    this._loading = false;
    this._queue = [];
  }

  on(eventName, callback) {
    super.on.call(this, eventName, callback, false);
  }

  off(eventName, callback) {
    super.off.call(this, eventName, callback);
  }

  toBitmapData(matrix) {
    let bmd = new BitmapData(this.content.width, this.content.height);
    bmd.draw(this.content, matrix);
    return bmd;
  }

  load(request) {
    let params = [];
    request.method = request.method.toUpperCase();
    if (request === null) {
      console.error("Loader need URLRequest instance"); // jshint ignore:line
      return;
    }

    if (this._loading) {
      this._queue.push(request);
      return;
    }

    let url = request.url;
    let data = request.data;
    let keys = Util.keys(request.data);
    if (keys.length) {
      params = Util.map(request.data, (val, key) => {
        return key + "=" + encodeURIComponent(val);
      });
      data = params.join("&");
    }

    if (request.method === "GET") {
      if (keys.length) {
        url += "?" + data;
      }
      data = null;
    }

    this.content.onload = () => {
      this._onload();
    };

    this.content.onerror = () => {
      this._onerror();
    };

    this.content.src = url;
    this._loading = true;
  }

  close() {
    this._close = true;
  }

  _onload() {
    if (!this._close) {
      this.trigger(this, LoaderEvent.COMPLETE, {
        target: this
      });
    }

    this._close = false;
    this._loading = false;
    this._next();
  }

  _onerror(ev) {
    if (!this._close) {
      this.trigger(this, LoaderEvent.ERROR, ev);
    }

    this._close = false;
    this._loading = false;
    this._next();
  }

  _next() {
    if (this._queue.length) {
      this.load(this._queue.shift());
    }
  }
}

module.exports = Loader;
