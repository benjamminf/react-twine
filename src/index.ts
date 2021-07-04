import { ActionCreator, bootstrapAction } from './action';
import { bootstrapComputed, ComputedCreator } from './computed';
import { createDependencyStore } from './dependencyStore';
import { createFactory, FactoryCreator } from './factory';
import { bootstrapProxyState, ProxyStateCreator } from './proxyState';
import { bootstrapSelector, SelectorCreator } from './selector';
import { bootstrapState, StateCreator } from './state';
import { createTransactor } from './transactor';

export function bootstrap(): {
  createAction: ActionCreator;
  createComputed: ComputedCreator;
  createFactory: FactoryCreator;
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
  const createComputed = bootstrapComputed({ createSelector });

  return {
    createAction,
    createComputed,
    createFactory,
    createProxyState,
    createSelector,
    createState,
  };
}
