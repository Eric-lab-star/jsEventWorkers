import EventDelegatingWorker from "./event-delegate/main.js";

const worker = new EventDelegatingWorker("./event-delegate/worker.js", {
  type: "module",
});

const canvas = document.getElementById("canvas");
worker.addEventTarget(canvas, "canvas");
try {
  const off_canvas = canvas.transferControlToOffscreen();
  worker.postMessage(off_canvas, [off_canvas]);
} catch (e) {
  // no support for OffscreenCanvas, we'll just log evt
  worker.onmessage = (evt) => {
    log("from worker", evt.data);
  };
}
