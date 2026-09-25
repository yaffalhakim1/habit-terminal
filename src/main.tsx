import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './theme.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { createAppLifecycle } from './appLifecycle'

declare global {
  interface Window {
    __habitTerminalAppVisible?: boolean
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

const rootElement = document.getElementById('root')
let root: Root | null = null

function renderApp() {
  if (!rootElement || root) return

  root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}

function unmountApp() {
  root?.unmount()
  root = null
}

const lifecycle = createAppLifecycle(renderApp, unmountApp)

window.addEventListener('habit-terminal:app-open', () => lifecycle.open())
window.addEventListener('habit-terminal:app-close', () => lifecycle.close())

if (window.__habitTerminalAppVisible) {
  lifecycle.open()
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs =>
    regs.forEach(r => r.unregister())
  );
}
