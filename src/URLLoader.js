import EventDispatcher from "./EventDispatcher";
import URLLoaderEvent from "./URLLoaderEvent";
import Util from "./Util";

class URLLoader extends EventDispatcher {
  constructor(request) {
    super();
    this._request = request;
    this._close = false;
    this._loading = false;
    this._queue = [];
  }

  on(eventName, callback) {
    super.on.apply(this, [this, eventName, callback, false]);
  }

  off(eventName, callback) {
    super.off.apply(this, [this, eventName, callback]);
  }

  load(request) {
    let xhr = false;
    let params = [];
    request = request || this._request;
    request.method = request.method.toUpperCase();

    if (request === null) {
      console.error("URLLoader need URLRequest instance"); // jshint ignore:line
      return xhr;
    }

    if (this._loading) {
      this._queue.push(request);
      return xhr;
    }

    // jshint ignore:start
    try {
      xhr = new XMLHttpRequest();
    } catch (e) {}
    // jshint ignore:end

    if (xhr === false) {
      console.error("xhr cant be init"); // jshint ignore:line
      return xhr;
    }

    this._xhr = xhr;

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

    xhr.open(request.method, url, true);
    xhr.onreadystatechange = () => {
      this._onreadystatechange();
    };

    if (request.contentType) {
      request.requestHeaders["Content-Type"] = request.contentType;
    }

    Util.each(request.requestHeaders, (val, key) => {
      xhr.setRequestHeader(key, val);
    });

    xhr.send(data);
    this._loading = true;
  }

  close() {
    this._close = true;
  }

  _onreadystatechange() {
    let xhr = this._xhr;
    let eventName = "";

    if (xhr.readyState === 4) {
      if (!this._close) {
        if (xhr.status === 200) {
          eventName = URLLoaderEvent.COMPLETE;
        } else {
          eventName = URLLoaderEvent.ERROR;
        }
        this.trigger(this, eventName, {
          data: xhr.responseText,
          status: xhr.status
        });
      }

      this._close = false;
      this._loading = false;
      this._next();
    }
  }

  _next() {
    if (this._queue.length) {
      this.load(this._queue.shift());
    }
  }
}

module.exports = URLLoader;
