import createAction from './createAction';
import createMutableState from './createMutableState';
import createSelector, {Selector} from './createSelector';
import {State} from './createState';
import deriveState from './deriveState';
import isSelector from './isSelector';
import isValueInRange, {ValueRange} from './isValueInRange';
import mapCompare from './mapCompare';
import setCompare from './setCompare';

export type Factory<K, V> = ((key: K) => V) &
  State<Map<K, V>> & {keys: Selector<Set<K>>};

export default function createFactory<K, V>(
  fn: (key: K) => V,
  keyRange: ValueRange<K> | Selector<ValueRange<K>> = () => true
): Factory<K, V> {
  const keysState = createMutableState(new Set<K>());
  const keysSelector = createSelector(({get}) => new Set(get(keysState)));

  const keyRangeSelector = isSelector<ValueRange<K>>(keyRange)
    ? keyRange
    : createSelector(() => keyRange);

  const valuesState = createMutableState(new Map<K, V>());

  const factoryState = deriveState(
    ({get}) => new Map(get(valuesState)),
    ({value: newValues, get, set}) => {
      const newKeys = new Set(newValues.keys());
      const oldValues = get(valuesState);
      const oldKeys = get(keysState);
      const hasNewKeys = !setCompare(newKeys, oldKeys);
      const hasNewValues = hasNewKeys || !mapCompare(newValues, oldValues);

      if (hasNewValues) {
        set(valuesState, new Map(newValues));
      }

      if (hasNewKeys) {
        set(keysState, newKeys);
      }
    }
  );

  const addAction = createAction<Map<K, V>>(({value: addValues, set}) => {
    set(
      keysState,
      keys => (addValues.forEach((_, key) => keys.add(key)), keys)
    );
    set(
      valuesState,
      values => (
        addValues.forEach((value, key) => values.set(key, value)), values
      )
    );
  });

  const deleteAction = createAction<Set<K>>(({value: deleteKeys, set}) => {
    set(keysState, keys => (deleteKeys.forEach(key => keys.delete(key)), keys));
    set(
      valuesState,
      values => (deleteKeys.forEach(key => values.delete(key)), values)
    );
  });

  keyRangeSelector.observe(range => {
    const allKeys = keysState.get();
    const deleteKeys = new Set(
      Array.from(allKeys).filter(key => !isValueInRange(key, range))
    );
    deleteAction.dispatch(deleteKeys);
  });

  function factory(key: K): V {
    if (!isValueInRange(key, keyRangeSelector.get())) {
      throw new RangeError(`Factory key "${key}" is out of bounds`);
    }

    const allValues = valuesState.get();
    const value = allValues.get(key) ?? fn(key);

    if (!allValues.has(key)) {
      const addValues = new Map([[key, value]]);
      addAction.dispatch(addValues);
    }

    return value;
  }

  return Object.assign(factory, factoryState, {
    keys: keysSelector,
  });
}
