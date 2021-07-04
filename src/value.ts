import { InitialValue, SetValue } from './types';

export type Values<A extends unknown[]> = A extends Array<infer V> ? V : never;
export type ValueRange<V> = Set<V> | ((value: V) => boolean);

export function resolveValue<V>(value: InitialValue<V>): V;
export function resolveValue<V>(value: SetValue<V>, get: () => V): V;
export function resolveValue<V>(
  value: InitialValue<V> | SetValue<V>,
  get?: () => V,
): V {
  return typeof value === 'function'
    ? get
      ? (value as (oldValue: V) => V)(get())
      : (value as () => V)()
    : value;
}

export function isValueInRange<V>(value: V, range: ValueRange<V>): boolean {
  return typeof range === 'function' ? range(value) : range.has(value);
}
