import {Getter, Selector, SelectorFactory, ValueRange} from './types';
import createFactory from './createFactory';
import createSelector from './createSelector';
import isSelector from './isSelector';
import map from './map';

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
