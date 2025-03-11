/**
 * Throttle and debounce utility functions
 */

/**
 * Creates a throttled function that only invokes func at most once per wait milliseconds
 * @param {Function} func The function to throttle
 * @param {number} wait The number of milliseconds to throttle invocations to
 * @returns {Function} Returns the new throttled function
 */
export const throttle = (func, wait = 100) => {
  let lastTime = 0
  let timeoutId = null

  return function throttled(...args) {
    const now = Date.now()
    const remaining = wait - (now - lastTime)

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastTime = now
      func.apply(this, args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now()
        timeoutId = null
        func.apply(this, args)
      }, remaining)
    }
  }
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked
 * @param {Function} func The function to debounce
 * @param {number} wait The number of milliseconds to delay
 * @returns {Function} Returns the new debounced function
 */
export const debounce = (func, wait = 100) => {
  let timeoutId = null

  return function debounced(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args)
      timeoutId = null
    }, wait)
  }
}