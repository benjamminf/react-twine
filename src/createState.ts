import {frameComplete} from './frame';

export type DefaultValue<T> = T | (() => T);

export type GetValue<T> = T;
export type GetMethod<T> = () => GetValue<T>;

export type SetValue<T> = T | ((value: T) => T);
export type SetMethod<T> = (value: SetValue<T>) => void;

export type Observer<T> = (value: T, oldValue: T) => void;
export type Unobserve = () => void;
export type Observers<T> = Set<Observer<T>>;
export type ObserveMethod<T> = ((observer: Observer<T>) => Unobserve) & {
  observers: Observers<T>;
};

export type State<T> = {
  get: GetMethod<T>;
  set: SetMethod<T>;
  observe: ObserveMethod<T>;
};

export default function createState<T>(
  defaultValue: DefaultValue<T>
): State<T> {
  const observers: Observers<T> = new Set();
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

    current = {value: newValue};

    frameComplete(
      observers,
      newValue !== oldValue
        ? () =>
            Array.from(observers).forEach(observer =>
              observer(newValue, oldValue)
            )
        : null
    );
  }

  function observe(observer: Observer<T>): Unobserve {
    observers.add(observer);

    return () => observers.delete(observer);
  }

  return {
    get,
    set,
    observe: Object.assign(observe, {observers}),
  };
}
