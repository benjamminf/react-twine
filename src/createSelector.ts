import createState, {
  GetValue,
  GetMethod,
  ObserveMethod,
  Unobserve,
  State,
  Observer,
} from './createState';

export type GetFunction = <T>(state: State<T>) => GetValue<T>;
export type Getter<T> = (get: GetFunction) => GetValue<T>;

export type Selector<T> = {
  get: GetMethod<T>;
  observe: ObserveMethod<T>;
};

export default function createSelector<T>(getter: Getter<T>): Selector<T> {
  const getDefaultValue = () => getter(state => state.get());
  const proxyState = createState<T>(getDefaultValue);
  const {observers} = proxyState.observe;
  const dependentState = new Set<State<any>>();
  const observedState = new Set<Unobserve>();
  let isStale = true;
  let isObserved = false;

  function getFunction<V>(state: State<V>): V {
    if (!dependentState.has(state)) {
      dependentState.add(state);
      observedState.add(state.observe(observeDependent));
    }

    return state.get();
  }

  function observeDependent(): void {
    observedState.forEach(unobserve => unobserve());
    observedState.clear();
    dependentState.clear();
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

  function get() {
    computeValue();

    return proxyState.get();
  }

  function observe(observer: Observer<T>) {
    computeValue();

    const unobserve = proxyState.observe(observer);
    isObserved = true;

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
