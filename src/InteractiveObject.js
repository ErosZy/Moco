import DisplayObject from "./DisplayObject";
import TouchEvent from "./TouchEvent";
import Util from "./Util";

export default class InteractiveObject extends DisplayObject {
  constructor() {
    super();
    this.name = "InteractiveObject";
  }

  on(eventName, callback, useCapture) {
    if (arguments.length > 1) {
      let eventNameUpperCase = eventName.toUpperCase();
      if (Util.inArray(eventNameUpperCase, TouchEvent.nameList) !== -1) {
        TouchEvent.add(eventName, this);
      }
      super.on(this, eventName, callback, useCapture);
    }
  }

  off(eventName, callback) {
    if (arguments.length) {
      let eventNameUpperCase = eventName.toUpperCase();
      if (Util.inArray(eventNameUpperCase, TouchEvent.nameList) !== -1) {
        TouchEvent.remove(eventName, this);
      }
    } else {
      Util.each(TouchEvent.nameList, eventName => {
        let eventNameLowerCase = eventName.toLowerCase();
        TouchEvent.remove(eventNameLowerCase, this);
      });
    }
    super.off(this, eventName, callback);
  }

  dispose(){
    this.off();
  }
}
