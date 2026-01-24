export async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0)
    return
  if (signal?.aborted) {
    const err = new DOMException('Aborted', 'AbortError')
    throw err
  }
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)

    function onAbort(): void {
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }

    function cleanup(): void {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
