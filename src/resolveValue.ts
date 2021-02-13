import {GetMethod, SetValue} from './createState';

export default function resolveValue<T>(
  value: SetValue<T>,
  get: GetMethod<T>
): T {
  return value instanceof Function ? value(get()) : value;
}
