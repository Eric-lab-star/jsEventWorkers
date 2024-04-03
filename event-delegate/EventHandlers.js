import EventDelegate from "./EventDelegate.js";

function eventDataChecker(evt) {
  if (evt.data instanceof OffscreenCanvas) {
    canvasReceiver(evt);
  } else {
    initDelegatedEventReceiver(evt);
  }
}

function initDelegatedEventReceiver(evt) {
  if (evt.data !== "init-event-delegation") {
    return;
  }

  evt.stopImmediatePropagation();
  removeEventListener("message", initDelegatedEventReceiver, true);

  // important
  // main_port recieve message when event target is added
  const main_port = evt.ports[0];
  main_port.addEventListener("message", recieveEventTarget);
  main_port.start();
}

// recieveEventTarget receive string type of context and
// Evtchan port
function recieveEventTarget(evt) {
  const targetAddedEvt = new Event("eventtargetadded");
  targetAddedEvt.delegatedTarget = new EventDelegate(evt.ports[0], evt.data);
  dispatchEvent(targetAddedEvt); // calls targetAddedHandler
}

let ctx;
function canvasReceiver(evt) {
  const canvas = evt.data;
  ctx = canvas.getContext("2d");
}

function draw(x, y) {
  const rad = 30;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fill();
}

function handleMouseMove(ctx) {
  return function (evt) {
    if (ctx) {
      draw(evt.offsetX, evt.offsetY);
    } else {
      postMessage(evt);
    }
  };
}

function targetAddedHandler({ delegatedTarget }) {
  if (delegatedTarget.context === "canvas") {
    delegatedTarget.addEventListener("mousemove", handleMouseMove(ctx));
  }
}

export {
  targetAddedHandler,
  initDelegatedEventReceiver,
  handleMouseMove,
  eventDataChecker,
  ctx,
};
