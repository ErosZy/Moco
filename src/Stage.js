import DisplayObjectContainer from "./DisplayObjectContainer";
import Util from "./Util";
import EventDispatcher from "./EventDispatcher";
import Timer from "./Timer";
import TouchEvent from "./TouchEvent";
import Sprite from "./Sprite";
import Vec3 from "./Vec3";

class Stage extends DisplayObjectContainer {
  constructor(instance, loop = true) {
    super();

    this.name = "Stage";
    this.loop = loop;
    if (instance.getContext) {
      this.domElem = instance;
      this.ctx = this.domElem.getContext("2d");
    } else {
      this.ctx = instance;
      this.domElem = instance.canvas;
    }

    this._width = parseFloat(this.domElem.width, 10);
    this._height = parseFloat(this.domElem.height, 10);

    let offset = this._getOffset();
    this.x = offset.left;
    this.y = offset.top;

    this._initialize();
  }

  _initialize() {
    Util.each(TouchEvent.nameList, eventName => {
      eventName = TouchEvent[eventName];
      EventDispatcher.prototype.on.call(
        this,
        this.domElem,
        eventName,
        event => {
          this._touchEvent(event);
        },
        false
      );
    });

    this.show(this._matrix);
    if (this.loop) {
      Timer.add(this);
      Timer.start();
    }
  }

  show(matrix) {
    if (this.loop) {
      this.ctx.clearRect(0, 0, this._width, this._height);
    }

    super.show(matrix);
    this.ctx.restore();
  }

  dispose() {}

  tick() {
    this.show(this._matrix);
  }

  addChild(child) {
    let addStage = child => {
      child.stage = this;
      if (child instanceof Sprite && child.graphics) {
        child.graphics.stage = this;
        child.graphics.parent = child;
        child.graphics.objectIndex = child.objectIndex + ".0";
      }
    };

    addStage(child);
    if (child.getAllChild) {
      let childs = child.getAllChild();
      Util.each(childs, item => {
        addStage(item);
      });
    }

    super.addChild(child);
  }

  isMouseOn() {
    return true;
  }

  getBounds() {
    return {
      sv: new Vec3(0, 0, 1),
      ev: new Vec3(this.width, this.height, 1)
    };
  }

  _touchEvent(event) {
    let cord = { x: 0, y: 0 };
    cord.x = event.clientX - this.x;
    cord.y = event.clientY - this.y;
    event.cord = cord;

    let eventName = event.type;
    let item = TouchEvent.getTopItem(eventName, cord);
    if (item) {
      item.trigger(eventName, event);
    }
  }

  _getOffset() {
    return { top: 0, left: 0 };
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }
}

module.exports = Stage;
