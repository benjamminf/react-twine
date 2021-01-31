import bucket, {Bucket} from './bucket';
import {frameComplete} from './frame';
import generateID from './generateID';

export type InitialValue<T> = T | (() => T);

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
  initialValue: InitialValue<T>
): State<T> {
  const stateID = generateID();
  const observers: Observers<T> = new Set();
  let current: Bucket<T> | null = null;

  function get(): T {
    current =
      current ??
      bucket(initialValue instanceof Function ? initialValue() : initialValue);

    return current.value;
  }

  function set(value: SetValue<T>): void {
    const isPreviousRequired = value instanceof Function || observers.size > 0;
    const previous = isPreviousRequired ? bucket(get()) : null;
    const next = bucket(value instanceof Function ? value(get()) : value);

    current = next;

    if (observers.size > 0 && previous && next.value !== previous.value) {
      const currentObservers = Array.from(observers);

      frameComplete(stateID, () =>
        currentObservers.forEach(observer =>
          observer(next.value, previous.value)
        )
      );
    }
  }

  function observe(observer: Observer<T>): Unobserve {
    const wrappedObserver = (value: T, oldValue: T) =>
      observer(value, oldValue);
    observers.add(wrappedObserver);

    return () => observers.delete(wrappedObserver);
  }

  return {
    get,
    set,
    observe: Object.assign(observe, {observers}),
  };
}
