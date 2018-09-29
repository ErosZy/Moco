import InteractiveEvent from "./InteractiveEvent";
import Util from "./Util";

class TouchEvent extends InteractiveEvent {
  static getTopItem(eventName, cord) {
    let items = this._list[eventName] || [];

    items = Util.filter(items, item => {
      if (item.visible && item.alpha && item.isMouseOn && item.isMouseOn(cord)) {
        return true;
      }
    });

    items = Array.prototype.sort.call(items, (i, j) => {
      let a1 = i.objectIndex.split(".");
      let a2 = j.objectIndex.split(".");
      let len = Math.max(a1.length, a2.length);

      for (let k = 0; k < len; k += 1) {
        if (!a2[k] || !a1[k]) {
          return a2[k] ? 1 : -1;
        } else if (a2[k] !== a1[k]) {
          return a2[k] - a1[k];
        }
      }
    });

    return items[0];
  }
}

let touchEvents = {
  TOUCHSTART: "touchstart",
  TOUCHEND: "touchend",
  TOUCHMOVE: "touchmove"
};

for (let key in touchEvents) {
  if (touchEvents.hasOwnProperty(key)) {
    TouchEvent[key] = touchEvents[key];
  }
}

TouchEvent.nameList = Util.keys(touchEvents);
module.exports = TouchEvent;
