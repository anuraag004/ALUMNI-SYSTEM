// src/utils/timeoutHandler.js
export const withTimeout = (promise, ms, errorMsg) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms)),
    ])
}
