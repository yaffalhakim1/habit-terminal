import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './theme.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'

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

window.addEventListener('habit-terminal:app-open', renderApp)
window.addEventListener('habit-terminal:app-close', unmountApp)

if (window.location.hash === '#app') {
  renderApp()
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs =>
    regs.forEach(r => r.unregister())
  );
}
