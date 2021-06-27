import { ValueRange } from './types';

export function isValueInRange<V>(value: V, range: ValueRange<V>): boolean {
  return range instanceof Function ? range(value) : range.has(value);
}
