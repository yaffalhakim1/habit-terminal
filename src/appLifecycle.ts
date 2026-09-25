export function createAppLifecycle(mount: () => void, unmount: () => void) {
  let mounted = false

  return {
    open() {
      if (mounted) return
      mount()
      mounted = true
    },
    close() {
      if (!mounted) return
      mounted = false
      unmount()
    },
  }
}
