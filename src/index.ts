import { bootstrapAction } from './action';
import { createDependencyStore } from './dependencyStore';
import { bootstrapProxyState } from './proxyState';
import { bootstrapSelector } from './selector';
import { bootstrapState } from './state';
import { createTransactor } from './transactor';
import {
  ActionCreator,
  ProxyStateCreator,
  SelectorCreator,
  StateCreator,
} from './types';

export function bootstrap(): {
  createAction: ActionCreator;
  createProxyState: ProxyStateCreator;
  createSelector: SelectorCreator;
  createState: StateCreator;
} {
  const dependencyStore = createDependencyStore();
  const transactor = createTransactor();

  const createAction = bootstrapAction({ transactor });
  const createSelector = bootstrapSelector({ dependencyStore, transactor });
  const createState = bootstrapState({ dependencyStore, createSelector });
  const createProxyState = bootstrapProxyState({
    createAction,
    createSelector,
  });

  return { createAction, createProxyState, createSelector, createState };
}
