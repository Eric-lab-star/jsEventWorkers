import { slotItem } from "./types";

const defaultOptionsDict = {
  once: false,
};

function stringifyOptions(options: typeof defaultOptionsDict) {
  if (typeof options === "boolean") {
    options = { once: options };
  }

  try {
    return JSON.stringify(
      Object.fromEntries(Object.entries(options).sort(byKeyAlpha)),
    );
  } catch (e) {
    return JSON.stringify(defaultOptionsDict);
  }
}

type keyValue = [any, any];

function byKeyAlpha(entry_a: keyValue, entry_b: keyValue): number {
  return entry_a[0].localeCompare(entry_b[0]);
}

function getStoredItem(
  slot: Array<slotItem>,
  {
    callback,
    options_as_string,
  }: { callback: Function; options_as_string: string },
) {
  return (
    Array.isArray(slot) &&
    slot.find((obj: slotItem) => {
      return (
        obj.callback === callback && obj.options_as_string === options_as_string
      );
    })
  );
}

export { defaultOptionsDict, stringifyOptions, getStoredItem };
