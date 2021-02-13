import {GetMethod, InitialValue, SetValue} from './types';

function resolveValue<T>(value: InitialValue<T>): T;
function resolveValue<T>(value: SetValue<T>, get: GetMethod<T>): T;
function resolveValue<T>(
  value: InitialValue<T> | SetValue<T>,
  get?: GetMethod<T>
): T {
  return value instanceof Function
    ? get
      ? value(get())
      : (value as () => T)()
    : value;
}

export default resolveValue;
