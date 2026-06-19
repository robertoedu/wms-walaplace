export const createMockStorage = ({
  key,
  version = null,
  eventName = "",
  createInitial,
  migrate,
}) => {
  const clone = (value) => JSON.parse(JSON.stringify(value));
  let fallbackValue = null;

  const dispatchChange = (value) => {
    if (!eventName) return;
    if (!globalThis.window?.dispatchEvent || typeof globalThis.CustomEvent !== "function") return;
    globalThis.window.dispatchEvent(new globalThis.CustomEvent(eventName, {
      detail: { key, version, value: clone(value) },
    }));
  };

  const persist = (value) => {
    fallbackValue = clone(value);
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  };

  const isVersionValid = (value) =>
    version === null || value?.version === version;

  const read = () => {
    if (!globalThis.localStorage && fallbackValue) return clone(fallbackValue);

    try {
      const saved = globalThis.localStorage?.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isVersionValid(parsed)) {
          fallbackValue = clone(parsed);
          return parsed;
        }
        if (migrate) {
          const migrated = migrate(parsed);
          if (migrated && isVersionValid(migrated)) {
            persist(migrated);
            return migrated;
          }
        }
      }
    } catch {
      // Recreate the mock when browser storage is invalid or unavailable.
      if (fallbackValue) return clone(fallbackValue);
    }

    const initialValue = createInitial();
    try {
      persist(initialValue);
    } catch {
      fallbackValue = clone(initialValue);
    }
    return initialValue;
  };

  const write = (value) => {
    try {
      persist(value);
    } catch {
      fallbackValue = clone(value);
    }
    dispatchChange(value);
    return value;
  };

  const reset = () => {
    const initialValue = createInitial();
    write(initialValue);
    return clone(initialValue);
  };

  return {
    clone,
    read,
    write,
    reset,
    key,
    version,
    eventName,
  };
};
