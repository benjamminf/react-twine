export type Task = () => void;

const completionTasks = new Map<any, Task>();
let isCapturing = false;

export function captureTasks(task: Task): void {
  if (isCapturing) {
    task();
  } else {
    isCapturing = true;

    task();
    completionTasks.forEach(task => task());
    completionTasks.clear();

    isCapturing = false;
  }
}

function queueTask(key: any, task: Task | null): void {
  captureTasks(() => {
    completionTasks.delete(key);

    if (task) {
      completionTasks.set(key, task);
    }
  });
}

export {queueTask};

export function isTaskCapturing(): boolean {
  return isCapturing;
}
