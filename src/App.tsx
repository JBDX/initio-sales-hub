import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { MaJournee } from './pages/MaJournee'
import { PipelineDevis } from './pages/PipelineDevis'
import { Clients } from './pages/Clients'
import { ClientDetail } from './pages/ClientDetail'
import { Mfa } from './pages/Mfa'
import { Dashboard } from './pages/Dashboard'
import { BaseSavoir } from './pages/BaseSavoir'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<MaJournee />} />
              <Route path="/devis" element={<PipelineDevis />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/mfa" element={<Mfa />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/base-savoir" element={<BaseSavoir />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
