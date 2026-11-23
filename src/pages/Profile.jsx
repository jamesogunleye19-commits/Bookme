import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Profile() {
  const { user, role, logout } = useAuth()
  return (
    <>
      <header className="top"><h1>Profile</h1></header>
      <div className="stack pad">
        <div className="card"><div className="avatar">{(user.displayName || user.email)[0].toUpperCase()}</div>
          <div className="grow"><b>{user.displayName || 'BookMe user'}</b><p className="muted">{user.email} · {role === 'provider' ? 'Service provider' : 'Customer'}</p></div></div>
        {role === 'provider' && <Link to="/provider/setup" className="btn full">Edit business profile</Link>}
        <button className="btn ghost full" onClick={logout}>Sign out</button>
      </div>
    </>
  )
}
