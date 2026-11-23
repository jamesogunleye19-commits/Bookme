import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { SERVICES } from '../data'

const STEPS = [
  ['🔎', 'Find', 'Browse cooks, barbers, decorators and more near you.'],
  ['📅', 'Book', 'Pick a date and time that works for you.'],
  ['✅', 'Manage', 'Track, change or cancel every booking in one place.'],
]

export default function Landing() {
  const { user, loading } = useAuth()
  if (!loading && user) return <Navigate to="/home" replace />
  return (
    <div className="landing">
      <div className="hero">
        <div className="orbit">
          {SERVICES.slice(0, 8).map((s, i) => (
            <span key={s.id} className="orb" style={{ '--a': `${i * 45}deg`, '--d': `${i * -1.2}s` }}>{s.icon}</span>
          ))}
          <div className="logo-mark">B</div>
        </div>
        <h1 className="brand">Book<span>Me</span></h1>
        <p className="tag">Trusted local services, booked in a minute.</p>
      </div>
      <section className="how">
        <h2>How BookMe works</h2>
        {STEPS.map(([i, t, d]) => (
          <div className="step" key={t}><div className="step-i">{i}</div><div><b>{t}</b><p>{d}</p></div></div>
        ))}
        <div className="chips">{SERVICES.map(s => <span key={s.id}>{s.icon} {s.name}</span>)}</div>
      </section>
      <div className="bottombar cta">
        <Link to="/auth?mode=signin" className="btn ghost">Sign in</Link>
        <Link to="/auth?mode=signup" className="btn">Get started</Link>
      </div>
    </div>
  )
}
