import { sanitizeEvent, default_event_options_dict } from "./utilz.js";

class EventDelegatingWorker extends Worker {
  constructor(url, options) {
    super(url, options);
    const mainChan = new MessageChannel();
    this.mainPort = mainChan.port2;
    this.postMessage("init-event-delegation", [mainChan.port1]);
  }

  // addEventTarget recieve canvas element
  // and connect addEventListener on canvas element
  addEventTarget(event_target, context) {
    const EvtChan = new MessageChannel();
    this.mainPort.postMessage(context, [EvtChan.port2]);

    EvtChan.port1.onmessage = (evt) => {
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

    function handleDOMEvent(domEvent) {
      EvtChan.port1.postMessage(sanitizeEvent(domEvent));
    }
  }
}

export default EventDelegatingWorker;
