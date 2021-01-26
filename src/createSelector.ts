import createState, {
  GetValue,
  GetMethod,
  ObserveMethod,
  Unobserve,
  Observer,
} from './createState';

export type GetFunction = <T>(selector: Selector<T>) => GetValue<T>;
export type Getter<T> = (get: GetFunction) => GetValue<T>;

export type Selector<T> = {
  get: GetMethod<T>;
  observe: ObserveMethod<T>;
};

const DEFAULT_VALUE = Symbol();
type DefaultValue = typeof DEFAULT_VALUE;

function enforceValue<T>(value: T | DefaultValue): T {
  if (value === DEFAULT_VALUE) {
    throw new Error(`Trying to access selector value before it's computed`);
  }

  return value;
}

export default function createSelector<T>(getter: Getter<T>): Selector<T> {
  const proxyState = createState<T | DefaultValue>(DEFAULT_VALUE);
  const {observers} = proxyState.observe;
  const dependencies = new Set<Selector<any>>();
  const observed = new Set<Unobserve>();
  let isStale = true;
  let isObserved = false;

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

    if (isObserved) {
      computeValue();
    }
  }

  function computeValue(): void {
    if (isStale) {
      proxyState.set(getter(getFunction));
      isStale = false;
    }
  }

  function get(): T {
    computeValue();

    return enforceValue(proxyState.get());
  }

  function observe(observer: Observer<T>) {
    computeValue();

    isObserved = true;
    const unobserve = proxyState.observe((value, oldValue) =>
      observer(enforceValue(value), enforceValue(oldValue))
    );

    return () => {
      unobserve();
      isObserved = observers.size > 0;
    };
  }

  return {
    get,
    observe: Object.assign(observe, {observers}),
  };
}
