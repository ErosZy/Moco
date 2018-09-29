import Util from "./Util";

class Timer {
  static add(timerObject) {
    let index = Util.inArray(timerObject, this._list, (obj, item) => {
      return obj.aIndex === item.aIndex;
    });

    if (index === -1) {
      this._list.push(timerObject);
    }

    return this;
  }

  static remove(timerObject) {
    let index = Util.inArray(timerObject, this._list, (obj, item) => {
      return obj.aIndex === item.aIndex;
    });

    if (index !== -1) {
      this._list.splice(index, 1);
    }

    return this;
  }

  static start() {
    this.isStoped = false;

    if (!this._isInit) {
      this._init();
    }

    this._raf();
    return this;
  }

  static stop() {
    this.isStoped = true;

    if (!this._isInit) {
      this._init();
    }

    this._craf();
    return this;
  }

  static _init() {
    let lastTime = 0;
    let vendors = ["webkit", "moz"];
    let requestAnimationFrame = window.requestAnimationFrame;
    let cancelAnimationFrame = window.cancelAnimationFrame;
    let i = vendors.length - 1;

    while (i >= 0 && !requestAnimationFrame) {
      requestAnimationFrame = window[vendors[i] + "RequestAnimationFrame"];
      cancelAnimationFrame = window[vendors[i] + "CancelAnimationFrame"];
      i -= 1;
    }

    if (!requestAnimationFrame || !cancelAnimationFrame) {
      requestAnimationFrame = callback => {
        let now = +new Date(),
          nextTime = Math.max(lastTime + 16, now);
        return setTimeout(() => {
          callback((lastTime = nextTime));
        }, nextTime - now);
      };

      cancelAnimationFrame = clearTimeout;
    }

    this._requestAnimationFrame = requestAnimationFrame;
    this._cancelAnimationFrame = cancelAnimationFrame;
    this._isInit = true;
  }

  static _raf() {
    this._timer = this._requestAnimationFrame.call(
      window,
      this._callback.bind(this)
    );
  }

  static _craf() {
    this._cancelAnimationFrame.call(window, this._timer);
  }

  static _callback() {
    let list = this._list;
    for (let i = 0, len = list.length; i < len; i += 1) {
      let item = list[i];
      if (item.tick) {
        item.tick();
      }
    }
    this._raf();
  }

  static get isStoped() {
    return this._isStoped;
  }

  static set isStoped(isStoped) {
    this._isStoped = isStoped;
  }

  static get _list() {
    this._list_ = this._list_ || [];
    return this._list_;
  }

  static set _list(list) {
    this._list_ = list;
  }

  static get _isInit() {
    return this._isInit_ || false;
  }

  static set _isInit(isInit) {
    this._isInit_ = isInit;
  }

  static get _timer() {
    return this._timer_;
  }

  static set _timer(timer) {
    this._timer_ = timer;
  }

  static get _requestAnimationFrame() {
    return this._requestAnimationFrame_;
  }

  static set _requestAnimationFrame(requestAnimationFrame) {
    this._requestAnimationFrame_ = requestAnimationFrame;
  }

  static get _cancelAnimationFrame() {
    return this._cancelAnimationFrame_;
  }

  static set _cancelAnimationFrame(cancelAnimationFrame) {
    this._cancelAnimationFrame_ = cancelAnimationFrame;
  }
}

module.exports = Timer;
