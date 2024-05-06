import EventDelegatingWorker from "./event-delegate/EventDelegatingWorker.js";

const EDWorker = new EventDelegatingWorker("./event-delegate/worker.js", {
  type: "module",
});

const canvas = document.getElementById("canvas");

EDWorker.addEventTarget(canvas, "canvas");

try {
  const off_canvas = canvas.transferControlToOffscreen();
  EDWorker.postMessage(off_canvas, [off_canvas]);
} catch (e) {
  EDWorker.onmessage = (evt) => {
    console.log("from worker", evt.data);
  };
}
