import Global from "./Global";
import Util from "./Util";

const returnTrue = () => {
  return true;
};

const returnFalse = () => {
  return false;
};

class EventDispatcher {
  on(target, eventName, callback, useCapture) {
    if (typeof target === "string") {
      [target, eventName, callback, useCapture] = [
        this,
        target,
        eventName,
        callback
      ];
    }

    if (eventName && callback) {
      useCapture = useCapture ? useCapture : false;
      if (Util.isType(eventName, "Array")) {
        Util.each(eventName, item => {
          EventDispatcher.prototype.on.call(this, item, callback, useCapture);
        });
      } else {
        let handlers = target.handlers;
        let fn = event => {
          let callbacks = handlers[eventName];
          let ev = this._normalization(event);

          for (let i = 0, len = callbacks.length; i < len; i += 1) {
            let item = callbacks[i];
            if (ev.isImmediatePropagationStopped()) {
              break;
            } else if (item._guid === fn._guid) {
              item._callback.call(this, ev);
            }
          }
        };

        fn._fnStr = callback._fntStr
          ? callback._fnStr
          : callback.toString().replace(Global.fnRegExp, "");
        fn._callback = callback;
        fn._useCapture = useCapture;
        fn._guid = Global.guid;
        Global.guid += 1;

        if (!handlers) {
          handlers = target.handlers = {};
        }

        if (!handlers[eventName]) {
          handlers[eventName] = [];
        }

        handlers[eventName].push(fn);

        if (handlers[eventName].length) {
          if (target.addEventListener) {
            target.addEventListener(eventName, fn, useCapture);
          }
        }
      }
    }

    return this;
  }

  off(target, eventName, callback) {
    if (typeof target === "string") {
      [target, eventName, callback] = [this, target, eventName];
    }

    if (eventName || callback) {
      if (Util.isType(eventName, "Array")) {
        Util.each(eventName, item => {
          EventDispatcher.prototype.off.call(this, target, item, callback);
        });
      } else if (!callback) {
        let handlers = target.handlers;
        if (handlers) {
          let callbacks = handlers[eventName] ? handlers[eventName] : [];
          Util.each(callbacks, item => {
            EventDispatcher.prototype.off.call(this, target, eventName, item);
          });
        }
      } else {
        let handlers = target.handlers;
        if (handlers) {
          let fnStr = callback._fnStr
            ? callback._fnStr
            : callback.toString().replace(Global.fnRegExp, "");
          let callbacks = handlers[eventName] ? handlers[eventName] : [];

          for (let i = callbacks.length - 1; i >= 0; i -= 1) {
            let item = callbacks[i];
            if (item._fnStr === fnStr) {
              Array.prototype.splice.call(callbacks, i, 1);
            }
          }
        }
      }
    }

    return this;
  }

  trigger(target, eventName, event) {
    if (!target && !eventName) {
      return;
    } else if (typeof target === "string") {
      [target, eventName, event] = [this, target, eventName];
    }

    let handlers = target && target.handlers;
    if (!handlers) {
      return this;
    }

    let callbacks = handlers[eventName] ? handlers[eventName] : [];
    if (!callbacks.length) {
      return this;
    }

    let ev = event || {};
    if (ev.target === null) {
      ev.target = ev.currentTarget = target;
    }

    ev = this._normalization(ev);

    let parent = target.parent || target.parentNode;
    let handlerList = {
      propagations: [],
      useCaptures: []
    };

    while (parent) {
      let handlers = parent.handlers;
      if (handlers) {
        let callbacks = handlers[eventName] ? handlers[eventName] : [];
        for (let i = 0, len = callbacks.length; i < len; i += 1) {
          let useCapture = callbacks[i]._useCapture;
          if (!useCapture) {
            handlerList.propagations.push({
              target: parent,
              callback: callbacks[i]
            });
          } else {
            let tmp = {
              target: parent,
              callback: callbacks[i]
            };

            if (!i) {
              handlerList.useCaptures.unshift(tmp);
            } else {
              handlerList.useCaptures.splice(1, 0, tmp);
            }
          }
        }
      }
      parent = parent.parent || parent.parentNode;
    }

    let useCaptures = handlerList.useCaptures;
    let prevTarget = null;
    ev.eventPhase = 0;
    for (let i = 0, len = useCaptures.length; i < len; i += 1) {
      let handler = useCaptures[i];
      target = handler.target;

      if (ev.isImmediatePropagationStopped()) {
        break;
      } else if (prevTarget === target && ev.isPropagationStopped()) {
        handler.callback.call(this, ev);
      } else {
        handler.callback.call(this, ev);
        prevTarget = target;
      }
    }

    let isUseCapturePhaseStopped = false;
    if (useCaptures.length) {
      isUseCapturePhaseStopped =
        ev.isImmediatePropagationStopped() || ev.isPropagationStopped();
    }

    ev.eventPhase = 1;
    for (let i = 0, len = callbacks.length; i < len; i += 1) {
      let item = callbacks[i];
      if (isUseCapturePhaseStopped) {
        break;
      } else {
        item.call(this, ev);
      }
    }

    let propagations = handlerList.propagations;
    prevTarget = null;
    ev.eventPhase = 2;
    for (let i = 0, len = propagations.length; i < len; i += 1) {
      let handler = propagations[i];
      target = handler.target;
      ev.target = target;
      if (isUseCapturePhaseStopped) {
        if (ev.isImmediatePropagationStopped() || ev.isPropagationStopped()) {
          break;
        } else {
          handler.callback.call(this, ev);
          prevTarget = target;
        }
      } else {
        if (ev.isImmediatePropagationStopped()) {
          break;
        } else if (ev.isPropagationStopped()) {
          if (prevTarget === target) {
            handler.callback.call(this, ev);
          } else {
            break;
          }
        } else {
          handler.callback.call(this, ev);
          prevTarget = target;
        }
      }
    }
  }

  // 屏蔽事件差异，包括各种属性和方法的兼容
  _normalization(event) {
    if (!event || !event.isPropagationStopped) {
      event = event ? event : {};

      let preventDefault = event.preventDefault;
      let stopPropagation = event.stopPropagation;
      let stopImmediatePropagation = event.stopImmediatePropagation;

      if (!event.target) {
        event.target = event.srcElement || document;
      }

      if (!event.currentTarget) {
        event.currentTarget = this;
      }

      event.relatedTarget =
        event.fromElement === event.target
          ? event.toElement
          : event.fromElement;

      event.preventDefault = () => {
        if (preventDefault) {
          preventDefault.call(event);
        }
        event.returnValue = false;
        event.isDefaultPrevented = returnTrue;
        event.defaultPrevented = true;
      };

      event.isDefaultPrevented = returnFalse;
      event.defaultPrevented = false;

      event.stopPropagation = () => {
        if (stopPropagation) {
          stopPropagation.call(event);
        }
        event.cancelBubble = true;
        event.isPropagationStopped = returnTrue;
      };

      event.isPropagationStopped = returnFalse;

      event.stopImmediatePropagation = () => {
        if (stopImmediatePropagation) {
          stopImmediatePropagation.call(event);
        }
        event.isImmediatePropagationStopped = returnTrue;
        event.stopPropagation();
      };

      event.isImmediatePropagationStopped = returnFalse;

      let clientX = 0;
      let clientY = 0;
      if (event.targetTouches && event.targetTouches.length >= 1) {
        const touch = event.targetTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      }
      event = Util.extends(event, { clientX, clientY });
    }

    return event;
  }
}

module.exports = EventDispatcher;
