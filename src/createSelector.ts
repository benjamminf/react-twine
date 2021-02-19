import {
  Unobserver,
  Observer,
  Getter,
  Observable,
  Selector,
  State,
} from './types';
import createState from './createState';
import once from './once';
import {queueTask} from './tasks';
import generateID from './generateID';
import isSelector from './isSelector';

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
  const dependencies = new Set<Observable<any>>();
  const observing = new Map<State<any>, Unobserver>();
  let isStale = true;
  let isComputing = false;
  let observerCount = 0;

  function getFunction<V>(observable: Observable<V>): V {
    const value = observable.get();

    if (!dependencies.has(observable)) {
      dependencies.add(observable);

      Array.from(
        isSelector(observable) ? observable.states() : [observable as State<V>]
      )
        .filter(state => !observing.has(state))
        .forEach((state: State<any>) => {
          observing.set(state, state.observe(observeDependent));
        });
    }

    return value;
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

  function observe(observer: Observer<T>) {
    computeValue();
    observerCount++;

    const unobserver = proxyState.observe((value, oldValue) =>
      observer(enforceValue(value), enforceValue(oldValue))
    );

    return once(() => {
      unobserver();
      observerCount--;
    });
  }

  function states(): Set<State<any>> {
    return new Set(observing.keys());
  }

  return {
    get,
    observe,
    states,
  };
}
