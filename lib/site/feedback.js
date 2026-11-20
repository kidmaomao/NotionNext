export function isFeedbackPath(path) {
  return typeof path === 'string' && /^\/?feedback(?:\.html)?\/?(?:[?#].*)?$/.test(path)
}
