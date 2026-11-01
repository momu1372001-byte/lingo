let toastCallback: ((msg: string) => void) | null = null;

export function setToastHandler(fn: (msg: string) => void) {
  toastCallback = fn;
}

export function toast(msg: string) {
  if (toastCallback) toastCallback(msg);
}
