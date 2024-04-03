import EventDelegate from "./EventDelegate.js";

function initDelegatedEventReceiver(evt) {
  if (evt.data !== "init-event-delegation") {
    return;
  }
  evt.stopImmediatePropagation();
  removeEventListener("message", initDelegatedEventReceiver, true);
  const main_port = evt.ports[0];
  main_port.onmessage = (evt) => {
    const target_added_evt = new Event("eventtargetadded");
    target_added_evt.delegatedTarget = new EventDelegate(
      evt.ports[0],
      evt.data,
    );
    dispatchEvent(target_added_evt);
  };
}

addEventListener("message", initDelegatedEventReceiver);

addEventListener("eventtargetadded", ({ delegatedTarget }) => {
  if (delegatedTarget.context === "canvas") {
    delegatedTarget.addEventListener("mousemove", handleMouseMove);
  }
});

let ctx;
function handleMouseMove(evt) {
  if (ctx) {
    draw(evt.offsetX, evt.offsetY);
  } else {
    // so we can log for browsers without OffscreenCanvas
    postMessage(evt);
  }
}

function draw(x, y) {
  const rad = 30;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fill();
}

onmessage = (evt) => {
  const canvas = evt.data;
  ctx = canvas.getContext("2d");
};

export {};
