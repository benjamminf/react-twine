import createFactory, {
  FactoryFunction,
  FactoryProperties,
} from './createFactory';
import createProxyState from './createProxyState';
import {Selector} from './createSelector';
import createState, {InitialValue, State} from './createState';
import isState from './isState';
import {ValueRange} from './isValueInRange';
import map from './map';

export type StateFactory<K, V> = FactoryFunction<K, State<V>> &
  FactoryProperties<K> &
  State<Map<K, V>>;

export default function createStateFactory<K, V>(
  fn: (key: K) => InitialValue<V> | State<V>,
  keyRange?: ValueRange<K> | Selector<ValueRange<K>>
): StateFactory<K, V> {
  const proxyFactory = createFactory(key => {
    const initialValueOrState = fn(key);
    return isState<V>(initialValueOrState)
      ? initialValueOrState
      : createState(initialValueOrState);
  }, keyRange);

  const factoryState = createProxyState(
    ({get}) => map(get(proxyFactory), state => get(state)),
    ({value: values, set}) => {
      values.forEach((value, key) => set(proxyFactory(key), value));
      set(
        proxyFactory,
        map(values, (_, key) => proxyFactory(key))
      );
    }
  );

  function factory(key: K): State<V> {
    return proxyFactory(key);
  }

  return Object.assign(factory, proxyFactory, factoryState);
}
