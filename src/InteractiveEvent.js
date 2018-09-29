import Util from "./Util";
import EventDispatcher from "./EventDispatcher";

class InteractiveEvent {
  static getList() {
    return Util.clone(this._list);
  }

  static add(eventName, item) {
    if (item instanceof EventDispatcher) {
      let list = this._list;
      list[eventName] = list[eventName] ? list[eventName] : [];

      let isNotExists =
        Util.inArray(item, list[eventName], (a1, a2) => {
          return a1.aIndex === a2.aIndex;
        }) === -1;

      if (isNotExists) {
        list[eventName].push(item);
      }
    }
  }

  static remove(eventName, item) {
    if (item instanceof EventDispatcher) {
      let list = this._list;
      if (list[eventName]) {
        let index = Util.inArray(item, list[eventName], (a1, a2) => {
          return a1.aIndex === a2.aIndex;
        });

        if (index !== -1) {
          list[eventName].splice(index, 1);
        }
      }
    }
  }

  static get _list() {
    this._list_ = this._list_ || {};
    return this._list_;
  }

  static set _list(list) {
    this._list_ = list;
  }
}

module.exports = InteractiveEvent;
