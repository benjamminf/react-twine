export type DefaultValue<T> = T | (() => T);

export type GetValue<T> = T;
export type GetMethod<T> = () => GetValue<T>;

export type SetValue<T> = T | ((currentValue: T | undefined) => T);
export type SetMethod<T> = (value: SetValue<T>) => void;

export type Observer<T> = (value: T, oldValue: T | undefined) => void;
export type Unobserve = () => void;
export type Observe<T> = (observer: Observer<T>) => Unobserve;

export type State<T> = {
  get: GetMethod<T>;
  set: SetMethod<T>;
  observe: Observe<T>;
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
    const newValue = value instanceof Function ? value(current?.value) : value;

    if (newValue !== current?.value) {
      const oldValue = current?.value;
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
