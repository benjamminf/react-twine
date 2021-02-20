import {
  Unobserver,
  Observer,
  Getter,
  Selector,
  GetMethod,
  ObserveMethod,
} from './types';
import createState from './createState';
import once from './once';
import {queueTask} from './tasks';
import generateID from './generateID';
import {
  handleInternalObserver,
  internallyObserve,
  isInternallyObserving,
} from './internalObserver';

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
  const dependencies = new Set<GetMethod<any>>();
  const observing = new Map<ObserveMethod<any>, Unobserver>();
  let isStale = true;
  let isComputing = false;
  let observerCount = 0;

  function getFunction<V>(selector: Selector<V>): V {
    if (!dependencies.has(selector.get)) {
      dependencies.add(selector.get);
      observing.set(
        selector.observe,
        internallyObserve(selector.observe, observeDependent, observingHandler)
      );
    }

    return selector.get();
  }

  function observingHandler(
    internalObserve: ObserveMethod<any>,
    internalObserver: Observer<any>
  ): void {
    if (!observing.has(internalObserve)) {
      observing.set(internalObserve, internalObserve(internalObserver));
    }
  }

  function observeDependent(): void {
    observing.forEach(unobserver => unobserver());
    observing.clear();
    dependencies.clear();
    isStale = true;

    queueTask(selectorID, completeObserveDependent);
  }

  function completeObserveDependent(): void {
    if (observerCount > 0) {
      computeValue();
    }
  }

  function computeValue(): void {
    if (isStale) {
      if (isComputing) {
        throw new Error('Circular dependency detected');
      }

      isComputing = true;
      proxyState.set(() => getter({get: getFunction}));
      isComputing = false;
      isStale = false;
    }
  }

  function get(): T {
    computeValue();

    return enforceValue(proxyState.get());
  }

  function observe(observer: Observer<T>): Unobserver {
    computeValue();

    if (isInternallyObserving()) {
      return handleInternalObserver(new Set(observing.keys()), observer);
    }

    observerCount++;

    const unobserver = proxyState.observe((value, oldValue) =>
      observer(enforceValue(value), enforceValue(oldValue))
    );

    return once(() => {
      unobserver();
      observerCount--;
    });
  }

  return {
    get,
    observe,
  };
}
