import { InitialValue, SetValue, ValueRange } from './types';

export function resolveValue<V>(value: InitialValue<V>): V;
export function resolveValue<V>(value: SetValue<V>, get: () => V): V;
export function resolveValue<V>(
  value: InitialValue<V> | SetValue<V>,
  get?: () => V,
): V {
  return value instanceof Function
    ? get
      ? value(get())
      : (value as () => V)()
    : value;
}

export function isValueInRange<V>(value: V, range: ValueRange<V>): boolean {
  return range instanceof Function ? range(value) : range.has(value);
}
