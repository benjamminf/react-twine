import createState, {
  Get,
  GetValue,
  Observe,
  Unobserve,
  State,
} from './createState';

export type GetProxy = <T>(state: State<T>) => GetValue<T>;
export type Getter<T> = (args: {get: GetProxy}) => GetValue<T>;

export type Selector<T> = {
  get: Get<T>;
  observe: Observe<T>;
};

export default function createSelector<T>(getter: Getter<T>): Selector<T> {
  const defaultValue = getter({get: state => state.get()});
  const proxyState = createState<T>(defaultValue);
  const observedState = new Set<Unobserve>();

  function deriver(): void {
    const dependentState = new Set<State<any>>();
    observedState.forEach(unobserve => unobserve());
    observedState.clear();
    proxyState.set(
      getter({
        get: state => {
          dependentState.add(state);
          return state.get();
        },
      })
    );
    dependentState.forEach(state => {
      observedState.add(state.observe(deriver));
    });
  }

  deriver();

  return {
    get: proxyState.get,
    observe: proxyState.observe,
  };
}
