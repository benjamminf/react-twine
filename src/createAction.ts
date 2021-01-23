import {SetValue, State} from './createState';
import {GetFunction} from './createSelector';

export type SetFunction = <T>(state: State<T>, value: SetValue<T>) => void;
export type Setter<T> = (value: T, set: SetFunction, get: GetFunction) => void;

export type Action<T> = (payload: T) => void;

function getFunction<T>(state: State<T>): T {
  return state.get();
}

function setFunction<T>(state: State<T>, value: SetValue<T>): void {
  state.set(value);
}

export default function createAction<T = void>(setter: Setter<T>): Action<T> {
  return function action(payload: T): void {
    setter(payload, setFunction, getFunction);
  };
}
