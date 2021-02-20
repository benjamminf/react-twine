import {ObserveMethod, Observer, Unobserver} from './types';

type Handler = (observe: ObserveMethod<any>, observer: Observer<any>) => void;

let currentHandler: Handler | null = null;

export function internallyObserve(
  observe: ObserveMethod<any>,
  observer: Observer<any>,
  handler: Handler
): Unobserver {
  const pastHandler = currentHandler;
  let unobserver: Unobserver | null = null;

  try {
    currentHandler = handler;
    unobserver = observe(observer);
  } finally {
    currentHandler = pastHandler;
  }

  return unobserver;
}

export function handleInternalObserver(
  observes: Set<ObserveMethod<any>>,
  observer: Observer<any>
): Unobserver {
  observes.forEach(observe => currentHandler?.(observe, observer));
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return () => {};
}

export function isInternallyObserving(): boolean {
  return currentHandler != null;
}
