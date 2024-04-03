const default_event_options_dict = {
  capture: false,
  passive: true,
};

const event_keys_to_remove = new Set(["view", "target", "currentTarget"]);

function sanitizeEvent(evt) {
  const copy = {};
  // Most events only have .isTrusted as own property, so we use a for in loop to get all
  // otherwise JSON.stringify() would just ignore them
  for (let key in evt) {
    if (event_keys_to_remove.has(key)) {
      continue;
    }
    copy[key] = evt[key];
  }

  const as_string = tryToStringify(copy);
  return JSON.parse(as_string);

  // over complicated recursive function to handle cross-origin access
  function tryToStringify() {
    const referenced_objects = new Set(); // for cyclic
    // for cross-origin objects (e.g window.parent in a cross-origin iframe)
    // we save the previous key value so we can delete it if throwing
    let lastKey;
    let nextVal = copy;
    let lastVal = copy;
    try {
      return JSON.stringify(copy, removeDOMRefsFunctionsAndCyclics);
    } catch (e) {
      delete lastVal[lastKey];
      return tryToStringify();
    }

    function removeDOMRefsFunctionsAndCyclics(key, value) {
      lastVal = nextVal;
      lastKey = key;

      if (typeof value === "function") {
        return;
      }
      if (typeof value === "string" || typeof value === "number") {
        return value;
      }
      if (value && typeof value === "object") {
        if (value instanceof Node) {
          return;
        }
        if (referenced_objects.has(value)) {
          return "[cyclic]";
        }
        referenced_objects.add(value);
        nextVal = value;
        return value;
      }
      return value;
    }
  }
}
export { sanitizeEvent, event_keys_to_remove, default_event_options_dict };
