import createFactory, {Factory} from './createFactory';
import createSelector, {Getter, Selector} from './createSelector';
import isSelector from './isSelector';
import {ValueRange} from './isValueInRange';

export type SelectorFactory<K, V> = Factory<K, Selector<V>>;

export default function createSelectorFactory<K, V>(
  fn: (key: K) => Getter<V> | Selector<V>,
  keyRange?: ValueRange<K> | Selector<ValueRange<K>>
): SelectorFactory<K, V> {
  return createFactory(key => {
    const defaultValOrSelector = fn(key);

    return isSelector<V>(defaultValOrSelector)
      ? defaultValOrSelector
      : createSelector(defaultValOrSelector);
  }, keyRange);
}
