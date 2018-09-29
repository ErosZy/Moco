import InteractiveObject from "./InteractiveObject";
import DisplayObject from "./DisplayObject";
import Util from "./Util";
import Matrix3 from "./Matrix3";
import Vec3 from "./Vec3";
import Global from "./Global";
import Event from "./Event";

class DisplayObjectContainer extends InteractiveObject {
  constructor() {
    super();
    this.name = "DisplayObjectContainer";
    this._childList = [];
  }

  addChild(child) {
    if (child instanceof DisplayObject) {
      let isNotExists =
        Util.inArray(child, this._childList, (child, item) => {
          return child.aIndex === item.aIndex;
        }) === -1;

      if (isNotExists) {
        child.parent = this;
        child.stage = child.stage ? child.stage : this.stage;
        child.objectIndex =
          this.objectIndex + "." + (this._childList.length + 1);
        this._childList.push(child);
      }
    }
  }

  removeChild(child) {
    if (child instanceof DisplayObject) {
      for (let i = this._childList.length - 1; i >= 0; i -= 1) {
        let item = this._childList[i];
        if (item.aIndex === child.aIndex) {
          item.parent = null;
          item.stage = null;
          Array.prototype.splice.call(this._childList, i, 1);
          break;
        }
      }
    }
  }

  getAllChild() {
    return Util.clone(this._childList);
  }

  getChildAt(index) {
    let len = this._childList.length;
    if (Math.abs(index) > len) {
      return;
    } else if (index < 0) {
      index = len + index;
    }
    return this._childList[index];
  }

  contains(child) {
    if (child instanceof DisplayObject) {
      return (
        Util.inArray(child, this._childList, (child, item) => {
          return child.aIndex === item.aIndex;
        }) !== -1
      );
    }
  }

  show(matrix) {
    if (matrix === null) {
      matrix = Matrix3.clone(this._matrix);
    }

    let ctx = this.ctx || this.stage.ctx;
    if (!super.show(matrix)) {
      return false;
    }

    for (let i = 0, len = this._childList.length; i < len; i += 1) {
      let item = this._childList[i];
      if (item.show) {
        item.show(this._matrix);
        ctx.restore();
      }
      item.trigger(Event.ENTER_FRAME);
    }

    this.trigger(Event.ENTER_FRAME);
    return true;
  }

  dispose() {
    Util.each(this._childList, child => {
      if (child && child.dispose) {
        child.dispose();
      }
    });
    
    this._childList = [];
    super.dispose();
  }

  isMouseOn(cord) {
    for (let i = 0, len = this._childList.length; i < len; i += 1) {
      let item = this._childList[i];
      if (item.isMouseOn && item.isMouseOn(cord)) {
        return true;
      }
    }

    return false;
  }

  getBounds() {
    let childList = this._childList;
    let sv = Vec3.clone(Global.maxNumberVec3);
    let ev = Vec3.clone(Global.minNumberVec3);

    Util.each(childList, child => {
      if (typeof child.getBounds === "function") {
        let bounds = child.getBounds();
        sv.x = bounds.sv.x < sv.x ? bounds.sv.x : sv.x;
        sv.y = bounds.sv.y < sv.y ? bounds.sv.y : sv.y;
        ev.x = bounds.ev.x > ev.x ? bounds.ev.x : ev.x;
        ev.y = bounds.ev.y > ev.y ? bounds.ev.y : ev.y;
      }
    });

    if (
      sv.x === Global.maxNumber ||
      ev.x === Global.minNumber ||
      sv.y === Global.maxNumber ||
      ev.y === Global.minNumber
    ) {
      sv = ev = Vec3.zero();
    }

    return {
      sv: sv,
      ev: ev
    };
  }

  get width() {
    let bounds = this.getBounds();
    return Math.abs(bounds.ev.x - bounds.sv.x);
  }

  get height() {
    let bounds = this.getBounds();
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
    for (let i = 0, len = this._childList.length; i < len; i += 1) {
      this._childList[i].alpha = alpha;
    }
  }
}

module.exports = DisplayObjectContainer;
