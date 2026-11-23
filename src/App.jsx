import { Routes, Route, Navigate, Outlet, NavLink } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Providers from './pages/Providers'
import Book from './pages/Book'
import Bookings from './pages/Bookings'
import Profile from './pages/Profile'
import Provider, { ProviderSetup } from './pages/Provider'

function Shell() {
  const { user, role, loading } = useAuth()
  if (loading) return <div className="center"><div className="spinner" /></div>
  if (!user) return <Navigate to="/auth" replace />
  const tab = ({ isActive }) => 'tab' + (isActive ? ' on' : '')
  return (
    <div className="app">
      <main className="page"><Outlet /></main>
      <nav className="bottombar">
        {role === 'provider' ? (
          <NavLink to="/provider" className={tab}><span>📥</span>Requests</NavLink>
        ) : (<>
          <NavLink to="/home" className={tab}><span>🏠</span>Home</NavLink>
          <NavLink to="/bookings" className={tab}><span>📅</span>Bookings</NavLink>
        </>)}
        <NavLink to="/profile" className={tab}><span>👤</span>Profile</NavLink>
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route element={<Shell />}>
        <Route path="/home" element={<Home />} />
        <Route path="/services/:sid" element={<Providers />} />
        <Route path="/book/:pid" element={<Book />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/provider" element={<Provider />} />
        <Route path="/provider/setup" element={<ProviderSetup />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
