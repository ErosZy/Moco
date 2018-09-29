import DisplayObjectContainer from "./DisplayObjectContainer";
import DisplayObject from "./DisplayObject";
import Shape from "./Shape";

class Sprite extends DisplayObjectContainer {
  constructor() {
    super();
    this.name = "Sprite";
    this._graphics = null;
  }

  addChild(child) {
    if (child instanceof Shape) {
      console.error(
        "shape object should be linked to Sprite's graphics property"
      ); // jshint ignore:line
    } else if (child instanceof Sprite && child.graphics) {
      child.graphics.stage = this.stage;
    }
    super.addChild(child);
  }

  removeChild(child) {
    if (child instanceof Shape) {
      console.error(
        "shape object should be linked to Sprite's graphics property"
      ); // jshint ignore:line
    } else {
      super.removeChild(child);
    }
  }

  show(matrix) {
    let ctx = this.ctx || this.stage.ctx;
    if (!super.show(matrix)) {
      return false;
    }

    if (this._graphics && this._graphics.show) {
      this._graphics.show(this._matrix);
      ctx.restore();
    }

    return true;
  }

  isMouseOn(cord) {
    let isMouseOn = super.isMouseOn(cord);
    if (!isMouseOn && this._graphics && this._graphics instanceof Shape) {
      isMouseOn = this._graphics.isMouseOn && this._graphics.isMouseOn(cord);
    }
    return isMouseOn;
  }

  set graphics(graphics) {
    this._graphics = graphics;
    this._graphics.stage = this.stage;
    this._graphics.parent = this;
    this._graphics.objectIndex = this.objectIndex + "..";
  }

  get graphics() {
    return this._graphics;
  }

  get width() {
    let shapeBounds = null;
    let bounds = super.getBounds();
    if (this._graphics instanceof Shape) {
      shapeBounds = this._graphics.getBounds();
    }

    if (shapeBounds) {
      bounds.sv.x =
        bounds.sv.x < shapeBounds.sv.x ? bounds.sv.x : shapeBounds.sv.x;
      bounds.ev.x =
        bounds.ev.x > shapeBounds.ev.x ? bounds.ev.x : shapeBounds.ev.x;
    }

    return Math.abs(bounds.ev.x - bounds.sv.x);
  }

  get height() {
    let shapeBounds = null;
    let bounds = super.getBounds();
    if (this._graphics instanceof Shape) {
      shapeBounds = this._graphics.getBounds();
    }

    if (shapeBounds) {
      bounds.sv.y =
        bounds.sv.y < shapeBounds.sv.y ? bounds.sv.y : shapeBounds.sv.y;
      bounds.ev.y =
        bounds.ev.y > shapeBounds.ev.y ? bounds.ev.y : shapeBounds.ev.y;
    }

    return Math.abs(bounds.ev.y - bounds.sv.y);
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
    if (this._graphics) {
      this._graphics.alpha = alpha;
    }

    for (let i = 0, len = this._childList.length; i < len; i += 1) {
      this._childList[i].alpha = alpha;
    }
  }
}

module.exports = Sprite;
