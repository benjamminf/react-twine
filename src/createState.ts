export type GetValue<T> = T;
export type Get<T> = () => GetValue<T>;

export type SetValue<T> = T | ((currentValue: T) => T);
export type Set<T> = (value: SetValue<T>) => void;

export type Observer<T> = (value: T, oldValue: T) => void;
export type Unobserve = () => void;
export type Observe<T> = (observer: Observer<T>) => Unobserve;

export type State<T> = {
  get: Get<T>;
  set: Set<T>;
  observe: Observe<T>;
};

export default function createState<T>(defaultValue: T): State<T> {
  const observers = new Set<Observer<T>>();
  let currentValue = defaultValue;

  function get(): T {
    return currentValue;
  }

  function set(value: SetValue<T>): void {
    const newValue = value instanceof Function ? value(currentValue) : value;

    if (newValue !== currentValue) {
      const oldValue = currentValue;
      currentValue = newValue;
      Array.from(observers).forEach(observer =>
        observer(currentValue, oldValue)
      );
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
