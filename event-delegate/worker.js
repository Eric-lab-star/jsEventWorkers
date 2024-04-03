import { eventDataChecker, targetAddedHandler } from "./EventHandlers.js";

addEventListener("message", eventDataChecker);
addEventListener("eventtargetadded", targetAddedHandler);

export {};
