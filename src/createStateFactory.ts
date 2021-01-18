import createSelector, {Selector} from './createSelector';
import createState, {DefaultValue, State} from './createState';
import isState from './isState';
import memo from './memo';

export type StateFactory<K, V> = ((key: K) => State<V>) & Selector<Map<K, V>>;

export default function createStateFactory<K, V>(
  fn: (key: K) => DefaultValue<V> | State<V>
): StateFactory<K, V> {
  const factoryKeys = createState(new Set<K>());

  const stateFactory = memo<State<V>, K>(key => {
    const defaultValOrState = fn(key);
    const state = isState<V>(defaultValOrState)
      ? defaultValOrState
      : createState(defaultValOrState);

    factoryKeys.set(keys => keys.add(key));

    return state;
  });

  const stateProxy = createSelector(
    ({get}) =>
      new Map(
        Array.from(get(factoryKeys), key => [key, get(stateFactory(key))])
      )
  );

  return Object.assign(stateFactory, stateProxy);
}
