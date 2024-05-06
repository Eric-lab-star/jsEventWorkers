const defaultOptionsDict = {
    once: false,
};
function stringifyOptions(options) {
    if (typeof options === "boolean") {
        options = { once: options };
    }
    try {
        return JSON.stringify(Object.fromEntries(Object.entries(options).sort(byKeyAlpha)));
    }
    catch (e) {
        return JSON.stringify(defaultOptionsDict);
    }
}
function byKeyAlpha(entry_a, entry_b) {
    return entry_a[0].localeCompare(entry_b[0]);
}
function getStoredItem(slot, { callback, options_as_string, }) {
    return (Array.isArray(slot) &&
        slot.find((obj) => {
            return (obj.callback === callback && obj.options_as_string === options_as_string);
        }));
}
export { defaultOptionsDict, stringifyOptions, getStoredItem };
