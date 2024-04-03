import { sanitizeEvent, default_event_options_dict } from "./utilz.js";

class EventDelegatingWorker extends Worker {
  constructor(url, options) {
    super(url, options);
    // this channel will be used to notify the Worker of added targets
    const channel = new MessageChannel();
    this._mainPort = channel.port2;
    this.postMessage("init-event-delegation", [channel.port1]);
  }
  addEventTarget(event_target, context) {
    // this channel will be used to notify us when the Worker adds or removes listeners
    // and to notify the worker of new events fired on the target
    const channel = new MessageChannel();
    channel.port1.onmessage = (evt) => {
      const { type, action } = evt.data;
      if (action === "add") {
        event_target.addEventListener(
          type,
          handleDOMEvent,
          default_event_options_dict,
        );
      } else if (action === "remove") {
        event_target.removeEventListener(
          type,
          handleDOMEvent,
          default_event_options_dict,
        );
      }
    };
    // let the Worker side know they have a new target they can listen on
    this._mainPort.postMessage(context, [channel.port2]);

    function handleDOMEvent(domEvent) {
      channel.port1.postMessage(sanitizeEvent(domEvent));
    }
  }
}

// Events can not be cloned as is, so we need to stripe out all non cloneable properties

export default EventDelegatingWorker;
