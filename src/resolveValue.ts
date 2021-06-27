import { InitialValue, SetValue } from './types';

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
