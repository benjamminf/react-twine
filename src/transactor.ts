import { Transactor } from './types';

export function createTransactor(): Transactor {
  let transacting = false;
  let finalOperations = new Set<() => void>();

  function transact(operation: () => void): void {
    const prevTransacting = transacting;
    transacting = true;
    operation();
    transacting = prevTransacting;

    if (!transacting) {
      finalOperations.forEach(observer => observer());
      finalOperations = new Set();
    }
  }

  function finalize(operation: () => void): void {
    transact(() => finalOperations.add(operation));
  }

  function unfinalize(operation: () => void): void {
    finalOperations.delete(operation);
  }

  function isTransacting(): boolean {
    return transacting;
  }

  return {
    transact,
    finalize,
    unfinalize,
    isTransacting,
  };
}
