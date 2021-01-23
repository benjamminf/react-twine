export type Task = () => void;

const completionTasks = new Map<any, Task>();
let isCapturing = false;

export function frameCapture(task: Task): void {
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

export function frameComplete(key: any, task: Task | null): void {
  if (isCapturing) {
    if (task) {
      completionTasks.set(key, task);
    } else {
      completionTasks.delete(key);
    }
  } else {
    task?.();
  }
}
