import Util from "./Util";
import Easing from "./Easing";
import Timer from "./Timer";

export default class Animate {
  static to(target, params) {
    if (!Util.isType(params, "Object")) {
      return;
    }

    this._addQueue({
      target: target,
      args: this._init.call(this, ...arguments)
    });
  }

  static from(target, params) {
    if (!Util.isType(params, "Object")) {
      return;
    }

    for (let key in params) {
      if (
        params.hasOwnProperty(key) &&
        key !== "onComplete" &&
        key !== "onCompleteParam"
      ) {
        let tmp = parseFloat(target[key]);
        target[key] = params[key];
        params[key] = tmp;
      }
    }

    arguments[1] = params;
    this._addQueue({
      target: target,
      args: this._init.call(this, ...arguments)
    });
  }

  static fromTo(target, fParams, tParams) {
    if (!Util.isType(tParams, "Object") || !Util.isType(fParams, "Object")) {
      return;
    }

    for (let key in fParams) {
      if (
        fParams.hasOwnProperty(key) &&
        key !== "onComplete" &&
        key !== "onCompleteParam"
      ) {
        target[key] = fParams[key];
      }
    }

    Array.prototype.splice.call(arguments, 1, 1);
    this._addQueue({
      target: target,
      args: this._init.call(this, ...arguments)
    });
  }

  static remove(animator) {
    let index = Util.inArray(animator, this._animators, (animator, item) => {
      return animator === item.target;
    });

    if (index !== -1) {
      this._animators.splice(index, 1);
    }
  }

  static resume(target) {
    let index = Util.inArray(target, this._pausedAnimators, (target, item) => {
      return target === item.target;
    });

    if (index > -1) {
      let item = this._pausedAnimators.splice(index, 1);
      item[0].timestamp = +new Date();
      this._animators.push(item[0]);
      this._animate();
    }
  }

  static pause(target) {
    let index = Util.inArray(target, this._animators, (target, item) => {
      return target === item.target;
    });

    if (index > -1) {
      let item = this._animators.splice(index, 1);
      this._pausedAnimators.push(item[0]);
    }
  }

  static start() {
    Util.each(this._animators, animators => {
      animators.timestamp = +new Date();
    });
    this._animate();
  }

  static stop() {
    this._isAnimated = false;
    Timer.remove(this);
  }

  static _init(target, params) {
    let attr = {};
    let fn = null;
    let fnParams = [];
    let type = {};
    let speed = 0;
    let val = [];

    for (let item in params) {
      if (params.hasOwnProperty(item)) {
        if (item === "onComplete") {
          fn = params[item];
        } else if (item === "onCompleteParam") {
          fnParams = params[item];
        } else {
          attr[item] = params[item];
        }
      }
    }

    type = arguments[2];
    if (typeof type === "object" && type.a && type.b) {
      type = arguments[2] || Easing.easeInSine;
      speed = arguments[3] || 1000;
      fn = fn || arguments[4];
      fnParams = fnParams || arguments[5];
    } else {
      type = Easing.easeInSine;
      speed = arguments[2] || 1000;
      fn = fn || arguments[3];
      fnParams = fnParams || arguments[4];
    }

    val.push(target, attr, type, speed, fn, fnParams);

    return val;
  }

  static _addQueue(animator) {
    let target = animator.target;
    let params = animator.args[1];

    animator.shouldStop = false;
    animator.timeCount = 0;
    animator.origin = {};

    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        animator.origin[key] = target[key];
      }
    }

    animator.timestamp = +new Date();
    this._animators.push(animator);
    this._animate();
  }

  static _cubicBezier(type, t) {
    let pa = { x: 0, y: 0 };
    let pb = type.a;
    let pc = type.b;
    let pd = { x: 1, y: 1 };

    return {
      x:
        pa.x * Math.pow(1 - t, 3) +
        3 * pb.x * t * Math.pow(1 - t, 2) +
        3 * pc.x * Math.pow(t, 2) * (1 - t) +
        pd.x * Math.pow(t, 3),
      y:
        pa.y * Math.pow(1 - t, 3) +
        3 * pb.y * t * Math.pow(1 - t, 2) +
        3 * pc.y * Math.pow(t, 2) * (1 - t) +
        pd.y * Math.pow(t, 3)
    };
  }

  static _animate() {
    if (!this._isAnimated) {
      this._isAnimated = true;
      Timer.add(this);
    }
  }

  static tick() {
    let renderTime = 1000 / 60;
    if (!this._animators.length || !this._isAnimated) {
      this.stop();
      return;
    }

    Util.each(this._animators, animator => {
      let [target, attrs, type, speed, fn, fnParams] = animator.args;
      let timestamp = +new Date();
      let timeCount = (animator.timeCount += timestamp - animator.timestamp);
      let shouldStop = (animator.shouldStop =
        speed - timeCount <= renderTime || timeCount > speed);
      let origin = animator.origin;
      let scale = this._cubicBezier(type, shouldStop ? 1 : timeCount / speed);
      for (let key in attrs) {
        if (attrs.hasOwnProperty(key)) {
          target[key] = origin[key] + (attrs[key] - origin[key]) * scale.y;
        }
      }

      if (shouldStop) {
        if (typeof fn === "function") {
          fn.call(target, fnParams);
        }
      }

      animator.timestamp = +new Date();
    });

    for (let i = this._animators.length - 1; i >= 0; i -= 1) {
      if (this._animators[i].shouldStop) {
        this._animators.splice(i, 1);
      }
    }
  }

  static get _animators() {
    this._animators_ = this._animators_ || [];
    return this._animators_;
  }

  static get _pausedAnimators() {
    this._pausedAnimators_ = this._pausedAnimators_ || [];
    return this._pausedAnimators_;
  }

  static get _isAnimated() {
    this._isAnimated_ = this._isAnimated_ || false;
    return this._isAnimated_;
  }

  static set _isAnimated(isAnimated) {
    this._isAnimated_ = isAnimated;
  }
}
