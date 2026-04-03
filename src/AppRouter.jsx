import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import ResellerDashboard from './components/ResellerDashboard'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/editor" element={<App initialScreen="editor" />} />
        <Route path="/dashboard" element={<ResellerDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
