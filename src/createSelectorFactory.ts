import createFactory, {
  FactoryFunction,
  FactoryProperties,
} from './createFactory';
import createSelector, {Getter, Selector} from './createSelector';
import isSelector from './isSelector';
import {ValueRange} from './isValueInRange';
import map from './map';

export type SelectorFactory<K, V> = FactoryFunction<K, Selector<V>> &
  FactoryProperties<K> &
  Selector<Map<K, V>>;

export default function createSelectorFactory<K, V>(
  fn: (key: K) => Getter<V> | Selector<V>,
  keyRange?: ValueRange<K> | Selector<ValueRange<K>>
): SelectorFactory<K, V> {
  const proxyFactory = createFactory(key => {
    const getterOrSelector = fn(key);

    return isSelector<V>(getterOrSelector)
      ? getterOrSelector
      : createSelector(getterOrSelector);
  }, keyRange);

  const factorySelector = createSelector(({get}) =>
    map(get(proxyFactory), state => get(state))
  );

  function factory(key: K): Selector<V> {
    return proxyFactory(key);
  }

  return Object.assign(factory, proxyFactory, factorySelector);
}
