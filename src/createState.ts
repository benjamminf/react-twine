import {
  InitialValue,
  Observer,
  Observers,
  SetValue,
  State,
  Unobserver,
} from './types';
import bucket, {Bucket} from './bucket';
import {taskComplete} from './task';
import generateID from './generateID';
import resolveValue from './resolveValue';

export default function createState<T>(
  initialValue: InitialValue<T>
): State<T> {
  const stateID = generateID();
  const observers: Observers<T> = new Set();
  let current: Bucket<T> | null = null;
  let past: Bucket<T> | null = null;

  function get(): T {
    current = current ?? bucket(resolveValue(initialValue));

    return current.value;
  }

  function set(value: SetValue<T>): void {
    past = past ?? (observers.size > 0 ? bucket(get()) : null);

    const previous = past;
    const next = bucket(resolveValue(value, get));

    current = next;

    taskComplete(
      stateID,
      previous && next.value !== previous.value
        ? () => {
            Array.from(observers).forEach(
              observer =>
                observers.has(observer) && observer(next.value, previous.value)
            );
            past = current;
          }
        : null
    );
  }

  function observe(observer: Observer<T>): Unobserver {
    const wrappedObserver = (value: T, oldValue: T) =>
      observer(value, oldValue);
    observers.add(wrappedObserver);

    return () => observers.delete(wrappedObserver);
  }

  return {
    get,
    set,
    observe,
  };
}
