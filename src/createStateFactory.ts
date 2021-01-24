import createFactory, {Factory} from './createFactory';
import {Selector} from './createSelector';
import createState, {DefaultValue, State} from './createState';
import isState from './isState';
import {ValueRange} from './isValueInRange';

export type StateFactory<K, V> = Factory<K, State<V>>;

export default function createStateFactory<K, V>(
  fn: (key: K) => DefaultValue<V> | State<V>,
  keyRange?: ValueRange<K> | Selector<ValueRange<K>>
): StateFactory<K, V> {
  return createFactory(key => {
    const defaultValOrState = fn(key);

    return isState<V>(defaultValOrState)
      ? defaultValOrState
      : createState(defaultValOrState);
  }, keyRange);
}
