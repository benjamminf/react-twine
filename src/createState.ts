export type DefaultValue<T> = T | (() => T);

export type GetValue<T> = T;
export type GetMethod<T> = () => GetValue<T>;

export type SetValue<T> = T | ((value: T) => T);
export type SetMethod<T> = (value: SetValue<T>) => void;

export type Observer<T> = (value: T, oldValue: T) => void;
export type Unobserve = () => void;
export type ObserveMethod<T> = (observer: Observer<T>) => Unobserve;

export type State<T> = {
  get: GetMethod<T>;
  set: SetMethod<T>;
  observe: ObserveMethod<T>;
};

export default function createState<T>(
  defaultValue: DefaultValue<T>
): State<T> {
  const observers = new Set<Observer<T>>();
  let current: {value: T} | null = null;

  function get(): T {
    current = current ?? {
      value: defaultValue instanceof Function ? defaultValue() : defaultValue,
    };

    return current.value;
  }

  function set(value: SetValue<T>): void {
    const oldValue = get();
    const newValue = value instanceof Function ? value(oldValue) : value;

    if (newValue !== oldValue) {
      current = {value: newValue};
      Array.from(observers).forEach(observer => observer(newValue, oldValue));
    }
  }

  function observe(observer: Observer<T>): Unobserve {
    observers.add(observer);

    return () => observers.delete(observer);
  }

  return {
    get,
    set,
    observe,
  };
}
