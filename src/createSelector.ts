import {Unobserver, Observer, Getter, Selector} from './types';
import createState from './createState';
import once from './once';
import {taskComplete} from './task';
import generateID from './generateID';

const UNINITIALIZED_VALUE = Symbol('Uninitialized value');
type UninitializedValue = typeof UNINITIALIZED_VALUE;

function enforceValue<T>(value: T | UninitializedValue): T {
  if (value === UNINITIALIZED_VALUE) {
    throw new Error(`Trying to access selector value before it's computed`);
  }

  return value;
}

export default function createSelector<T>(getter: Getter<T>): Selector<T> {
  const selectorID = generateID();
  const proxyState = createState<T | UninitializedValue>(UNINITIALIZED_VALUE);
  const dependencies = new Set<Selector<any>>();
  const observed = new Set<Unobserver>();
  let isStale = true;
  let observerCount = 0;

  function getFunction<V>(selector: Selector<V>): V {
    if (!dependencies.has(selector)) {
      dependencies.add(selector);
      observed.add(selector.observe(observeDependent));
    }

    return selector.get();
  }

  function observeDependent(): void {
    observed.forEach(unobserve => unobserve());
    observed.clear();
    dependencies.clear();
    isStale = true;

    taskComplete(selectorID, completeObserveDependent);
  }

  function completeObserveDependent(): void {
    if (observerCount > 0) {
      computeValue();
    }
  }

  function computeValue(): void {
    if (isStale) {
      proxyState.set(() => getter({get: getFunction}));
      isStale = false;
    }
  }

  function get(): T {
    computeValue();

    return enforceValue(proxyState.get());
  }

  function observe(observer: Observer<T>) {
    computeValue();
    observerCount++;

    const unobserve = proxyState.observe((value, oldValue) =>
      observer(enforceValue(value), enforceValue(oldValue))
    );

    return once(() => {
      unobserve();
      observerCount--;
    });
  }

  return {
    get,
    observe,
  };
}
