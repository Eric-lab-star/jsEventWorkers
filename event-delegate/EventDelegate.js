import {
  getStoredItem,
  stringifyOptions,
  defaultOptionsDict,
} from "./EventDelegateUtilz.js";

class EventDelegate {
  constructor(EvtPort, context) {
    this.EvtPort = EvtPort; // the port to communicate with main
    this.context = context; // can help identify our target
    this.callbacks = {}; // we'll store the added callbacks here

    EvtPort.onmessage = (evt) => {
      const evt_object = evt.data; // evt_obj is sanitized event
      const slot = this.callbacks[evt_object.type];

      if (slot) {
        const to_remove = [];
        slot.forEach(({ callback, options }, index) => {
          try {
            callback(evt_object);
          } catch (e) {
            // we don't want to block our execution,
            // but still, we should notify the exception
            setTimeout(() => {
              throw e;
            });
          }
          if (options.once) {
            to_remove.push(index);
          }
        });
        // remove 'once' events
        to_remove.reverse().forEach((index) => slot.splice(index, 1));
      }
    };
  }

  addEventListener(type, callback, options = defaultOptionsDict) {
    const callbacks = this.callbacks;
    let slot = callbacks[type];
    if (!slot) {
      slot = callbacks[type] = [];
      // add event to canvas element
      this.EvtPort.postMessage({ type, action: "add" });
    }
    const new_item = {
      callback,
      options,
      options_as_string: stringifyOptions(options),
    };
    if (!getStoredItem(slot, new_item)) {
      // add event to offscreencanvas
      slot.push(new_item);
    }
  }

  removeEventListener(type, callback, options = defaultOptionsDict) {
    const callbacks = this.callbacks;
    const slot = callbacks[type];
    const options_as_string = stringifyOptions(options);

    const item = getStoredItem(slot, {
      callback,
      options,
      options_as_string,
    });
    const index = item && slot.indexOf(item);

    if (item) {
      slot.splice(index, 1);
    }
    if (slot && !slot.length) {
      delete callbacks[type];
      // we tell the main thread to remove the event handler
      // only when there is no callbacks of this type anymore
      this.EvtPort.postMessage({ type, action: "remove" });
    }
  }
}

export default EventDelegate;
