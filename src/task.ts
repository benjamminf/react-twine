export type Task = () => void;

const completionTasks = new Map<any, Task>();
let isCapturing = false;

export function taskCapture(task: Task): void {
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

function taskComplete(key: any, task: Task | null): void {
  taskCapture(() => {
    completionTasks.delete(key);

    if (task) {
      completionTasks.set(key, task);
    }
  });
}

export {taskComplete};

export function isTaskCapturing(): boolean {
  return isCapturing;
}
