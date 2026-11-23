import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where, doc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import { money } from '../data'

export default function Bookings() {
  const { user } = useAuth()
  const [items, setItems] = useState(null)
  const [tab, setTab] = useState('upcoming')

  useEffect(() => onSnapshot(query(collection(db, 'bookings'), where('userId', '==', user.uid)),
    s => setItems(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))),
    () => setItems([])), [user.uid])

  async function cancel(b) {
    if (!window.confirm('Cancel this booking?')) return
    const batch = writeBatch(db)
    batch.update(doc(db, 'bookings', b.id), { status: 'cancelled' })
    if (b.slotId) batch.delete(doc(db, 'slots', b.slotId))
    await batch.commit()
  }
  const today = new Date().toISOString().slice(0, 10)
  const done = b => ['cancelled', 'declined', 'completed'].includes(b.status) || b.date < today
  const shown = (items || []).filter(b => tab === 'upcoming' ? !done(b) : done(b))

  return (
    <>
      <header className="top"><h1>My bookings</h1>
        <div className="seg">{['upcoming', 'past'].map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t === 'upcoming' ? 'Upcoming' : 'Past & cancelled'}</button>)}</div>
      </header>
      {!items ? <div className="center"><div className="spinner" /></div> : (
        <div className="stack">
          {shown.map(b => (
            <article className="card col" key={b.id}>
              <div className="between"><b>{b.serviceName} · {b.providerName}</b><span className={'pill ' + b.status}>{b.status}</span></div>
              <p className="muted">📅 {b.date} at {b.time}</p>
              <p className="muted">📍 {b.address}</p>
              <div className="between"><span>{money(b.price)}</span>
                {!done(b) && <button className="link" onClick={() => cancel(b)}>Cancel</button>}</div>
            </article>
          ))}
          {!shown.length && <p className="empty">Nothing here yet. Book a service from Home.</p>}
        </div>
      )}
    </>
  )
}
