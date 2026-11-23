import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { SERVICES } from '../data'

export default function Home() {
  const { user, role } = useAuth()
  const [q, setQ] = useState('')
  if (role === 'provider') return <Navigate to="/provider" replace />
  const list = SERVICES.filter(s => s.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <header className="top">
        <p>Hi {user.displayName?.split(' ')[0] || 'there'} 👋</p>
        <h1>What do you need today?</h1>
        <input className="search" placeholder="Search services" value={q} onChange={e => setQ(e.target.value)} />
      </header>
      <div className="grid">
        {list.map(s => (
          <Link key={s.id} to={`/services/${s.id}`} className="svc">
            <span className="svc-i" style={{ background: s.color + '22' }}>{s.icon}</span>
            {s.name}
          </Link>
        ))}
        {!list.length && <p className="empty">No service matches “{q}”.</p>}
      </div>
    </>
  )
}
