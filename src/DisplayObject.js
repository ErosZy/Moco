import Global from "./Global";
import Matrix3 from "./Matrix3";
import Util from "./Util";
import EventDispatcher from "./EventDispatcher";
import Event from "./Event";

class DisplayObject extends EventDispatcher {
  constructor() {
    super();
    this.name = "DisplayObject";
    this.parent = null;
    this.globalCompositeOperation = "";
    this._mask = null;
    this._x = 0;
    this._y = 0;
    this._rotate = 0;
    this._scaleX = 1;
    this._scaleY = 1;
    this._height = 0;
    this._width = 0;
    this._alpha = 1;
    this.visible = true;
    this._addedToStage = false;
    this._matrix = Matrix3.identity();
    this.aIndex = this.objectIndex = "" + Global.guid;
    Global.guid += 1;
  }

  on() {
    super.on.apply(this, arguments);
  }

  off() {
    super.off.apply(this, arguments);
  }

  show(matrix) {
    let ctx = this.ctx || this.stage.ctx;
    let { x, y, scaleX, scaleY, alpha, rotate, visible, mask } = this;
    this._matrix = Matrix3.identity();
    ctx.save();

    if (!visible || !alpha) {
      this._triggerAddToStageEvent();
      return false;
    }

    if (mask !== null && mask.show) {
      mask.show(matrix);
      ctx.clip();
    }

    if (this.globalCompositeOperation !== "") {
      ctx.globalCompositeOperation = this.globalCompositeOperation;
    }

    ctx.globalAlpha = alpha < 1 ? alpha : 1;
    this._matrix.multi(matrix);

    if (x !== 0 || y !== 0) {
      this._matrix.multi(Matrix3.translation(x, y));
      ctx.translate(x, y);
    }

    if (rotate !== 0) {
      this._matrix.multi(Matrix3.rotation(rotate));
      ctx.rotate(Util.deg2rad(rotate));
    }

    if (scaleX !== 1 || scaleY !== 1) {
      this._matrix.multi(Matrix3.scaling(scaleX, scaleY));
      ctx.scale(scaleX, scaleY);
    }

    this._triggerAddToStageEvent();
    return true;
  }

  // jshint ignore:start

  isMouseOn(cord) {
    // abstrct method, child class need to realize
  }

  getBounds() {
    // abstrct method, child class need to realize
  }

  // jshint ignore:end

  dispose() {
    this.off();
    this._mask = null;
  }

  _triggerAddToStageEvent() {
    if (!this._addedToStage) {
      this._addedToStage = true;
      this.trigger(Event.ADD_TO_STAGE);
    }
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get x() {
    return this._x;
  }

  set x(x) {
    this._x = x;
  }

  get y() {
    return this._y;
  }

  set y(y) {
    this._y = y;
  }

  get rotate() {
    return this._rotate;
  }

  set rotate(rotate) {
    this._rotate = rotate;
  }

  get scaleX() {
    return this._scaleX;
  }

  set scaleX(scaleX) {
    this._scaleX = scaleX;
  }

  get scaleY() {
    return this._scaleY;
  }

  set scaleY(scaleY) {
    this._scaleY = scaleY;
  }

  get alpha() {
    return this._alpha;
  }

  set alpha(alpha) {
    if (alpha > 1) {
      alpha = 1;
    } else if (alpha < 0.001) {
      alpha = 0;
    }
    this._alpha = alpha;
  }

  get mask() {
    return this._mask;
  }

  set mask(mask) {
    this._mask = mask;
  }
}

module.exports = DisplayObject;
