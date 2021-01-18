import createState, {
  GetValue,
  GetMethod,
  ObserveMethod,
  Unobserve,
  State,
} from './createState';

export type GetFunction = <T>(state: State<T>) => GetValue<T>;
export type Getter<T> = (get: GetFunction) => GetValue<T>;

export type Selector<T> = {
  get: GetMethod<T>;
  observe: ObserveMethod<T>;
};

export default function createSelector<T>(getter: Getter<T>): Selector<T> {
  const defaultValue = getter(state => state.get());
  const proxyState = createState<T>(defaultValue);
  const dependentState = new Set<State<any>>();
  const observedState = new Set<Unobserve>();

  function getFunction<V>(state: State<V>): V {
    if (!dependentState.has(state)) {
      dependentState.add(state);
      observedState.add(state.observe(deriver));
    }

    return state.get();
  }

  function deriver(): void {
    observedState.forEach(unobserve => unobserve());
    observedState.clear();
    dependentState.clear();
    proxyState.set(getter(getFunction));
  }

  deriver();

  return {
    get: proxyState.get,
    observe: proxyState.observe,
  };
}
