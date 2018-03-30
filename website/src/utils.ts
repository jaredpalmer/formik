export const get = (obj: any, path: string, fallback: any) =>
  path.split('.').reduce((a, b) => (a && a[b] ? a[b] : null), obj) || fallback;
