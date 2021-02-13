import {ValueRange} from './types';

export default function isValueInRange<V>(
  value: V,
  range: ValueRange<V>
): boolean {
  if (range instanceof Function) {
    return range(value);
  }

  if (Array.isArray(range)) {
    return range.includes(value);
  }

  if (range instanceof Set || range instanceof Map) {
    return range.has(value);
  }

  for (const validValue of range) {
    if (validValue === value) {
      return true;
    }
  }

  return false;
}
