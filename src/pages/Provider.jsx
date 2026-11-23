import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { collection, doc, onSnapshot, query, where, writeBatch, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import { SERVICES, money } from '../data'

export default function Provider() {
  const { user, role, profile, reload } = useAuth()
  const [items, setItems] = useState(null)
  const [tab, setTab] = useState('pending')

  useEffect(() => onSnapshot(query(collection(db, 'bookings'), where('providerId', '==', user.uid)),
    s => setItems(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))),
    () => setItems([])), [user.uid])

  if (role !== 'provider') return <Navigate to="/home" replace />
  if (!profile) return <Navigate to="/provider/setup" replace />

  async function setStatus(b, status) {
    const batch = writeBatch(db)
    batch.update(doc(db, 'bookings', b.id), { status })
    if (status === 'declined' && b.slotId) batch.delete(doc(db, 'slots', b.slotId)) // frees the time
    await batch.commit()
  }
  async function toggle(e) { await updateDoc(doc(db, 'providers', user.uid), { available: e.target.checked }); reload() }

  const groups = {
    pending: b => b.status === 'pending',
    upcoming: b => b.status === 'confirmed',
    history: b => ['completed', 'declined', 'cancelled'].includes(b.status),
  }
  const list = (items || []).filter(groups[tab])
  const count = k => (items || []).filter(groups[k]).length

  return (
    <>
      <header className="top">
        <p>{profile.serviceName}</p><h1>{profile.name}</h1>
        <label className="toggle" style={{ marginTop: 12 }}><input type="checkbox" checked={profile.available !== false} onChange={toggle} />
          Accepting new bookings</label>
        <div className="seg">{[['pending', 'Requests'], ['upcoming', 'Upcoming'], ['history', 'History']].map(([k, l]) =>
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l} {count(k) ? `(${count(k)})` : ''}</button>)}</div>
      </header>
      {!items ? <div className="center"><div className="spinner" /></div> : (
        <div className="stack">
          {list.map(b => (
            <article className="card col" key={b.id}>
              <div className="between"><b>{b.customerName}</b><span className={'pill ' + b.status}>{b.status}</span></div>
              <p className="muted">📅 {b.date} at {b.time} · {money(b.price)}</p>
              <p className="muted">📍 {b.address}</p>
              <p className="muted">📞 <a href={`tel:${b.customerPhone}`}>{b.customerPhone}</a></p>
              {b.notes && <p className="muted">“{b.notes}”</p>}
              {b.status === 'pending' && <div className="actions">
                <button className="btn danger" onClick={() => setStatus(b, 'declined')}>Decline</button>
                <button className="btn" onClick={() => setStatus(b, 'confirmed')}>Accept</button></div>}
              {b.status === 'confirmed' && <button className="btn" onClick={() => setStatus(b, 'completed')}>Mark as completed</button>}
            </article>
          ))}
          {!list.length && <p className="empty">{tab === 'pending' ? 'No new requests. Customers will appear here when they book you.' : 'Nothing here yet.'}</p>}
        </div>
      )}
    </>
  )
}

export function ProviderSetup() {
  const { user, role, profile, reload } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState({
    name: profile?.name || user.displayName || '', serviceId: profile?.serviceId || 'cooking',
    price: profile?.price || '', location: profile?.location || '', bio: profile?.bio || '',
  })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  if (role !== 'provider') return <Navigate to="/home" replace />

  async function save(e) {
    e.preventDefault()
    if (!(Number(f.price) > 0)) return setErr('Enter a starting price above 0.')
    setBusy(true); setErr('')
    const svc = SERVICES.find(s => s.id === f.serviceId)
    try {
      await setDoc(doc(db, 'providers', user.uid), {
        name: f.name.trim(), serviceId: svc.id, serviceName: svc.name, price: Number(f.price),
        location: f.location.trim(), bio: f.bio.trim(),
        ...(profile ? {} : { rating: 'New', reviews: 0, available: true }),
      }, { merge: true })
      await reload(); nav('/provider')
    } catch { setErr('Could not save. Check your connection and try again.'); setBusy(false) }
  }

  return (
    <>
      <header className="top"><h1>{profile ? 'Edit business profile' : 'Set up your business'}</h1>
        <p>Customers see this when they browse {profile ? 'services' : 'your category'}.</p></header>
      <form className="stack pad" onSubmit={save}>
        <label>Business or display name<input value={f.name} onChange={set('name')} required /></label>
        <label>Service you offer<select value={f.serviceId} onChange={set('serviceId')}>
          {SERVICES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}</select></label>
        <label>Starting price (₦)<input type="number" min="1" value={f.price} onChange={set('price')} required /></label>
        <label>Area you serve<input placeholder="e.g. Lekki, Lagos" value={f.location} onChange={set('location')} required /></label>
        <label>About you<textarea rows={4} value={f.bio} onChange={set('bio')} placeholder="Experience, what's included, tools you bring" required /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn full" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
        {profile && <Link to="/provider" className="btn ghost full">Cancel</Link>}
      </form>
    </>
  )
}
