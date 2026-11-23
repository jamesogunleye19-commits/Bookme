import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { collection, doc, onSnapshot, query, where, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import { SLOTS, money } from '../data'

export const slotId = (pid, date, time) => `${pid}_${date}_${time.replace(':', '')}`

export default function Book() {
  const { state } = useLocation()
  const p = state?.provider
  const { user } = useAuth()
  const nav = useNavigate()
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [time, setTime] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [taken, setTaken] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!p) return
    setTime('')
    return onSnapshot(query(collection(db, 'slots'), where('providerId', '==', p.id), where('date', '==', date)),
      s => setTaken(s.docs.map(d => d.data().time)), () => setTaken([]))
  }, [p, date])
  if (!p) return <Navigate to="/home" replace />

  const now = new Date()
  const past = t => date === today && new Date(`${date}T${t}`) <= now

  async function confirm() {
    if (!time || !address.trim() || phone.trim().length < 7) return setErr('Choose a time and enter your phone number and address.')
    setBusy(true); setErr('')
    try {
      const batch = writeBatch(db)
      const ref = doc(collection(db, 'bookings'))
      const sid = slotId(p.id, date, time)
      batch.set(ref, {
        userId: user.uid, customerName: user.displayName || user.email, customerPhone: phone.trim(),
        providerId: p.id, providerName: p.name, serviceId: p.serviceId, serviceName: p.serviceName,
        price: p.price, date, time, address: address.trim(), notes: notes.trim(),
        slotId: sid, status: 'pending', createdAt: serverTimestamp(),
      })
      batch.set(doc(db, 'slots', sid), { providerId: p.id, date, time, userId: user.uid })
      await batch.commit()
      nav('/bookings')
    } catch {
      setErr('That time was just taken or the booking failed. Pick another time.'); setBusy(false)
    }
  }

  return (
    <>
      <header className="top row"><button className="back" onClick={() => nav(-1)}>‹</button><h1>Book {p.name}</h1></header>
      <div className="stack pad">
        <div className="card"><div className="avatar">{p.name[0]}</div><div className="grow"><b>{p.serviceName}</b><p className="muted">From {money(p.price)}</p></div></div>
        <label>Date<input type="date" min={today} value={date} onChange={e => setDate(e.target.value)} /></label>
        <div><span className="lbl">Time</span>
          <div className="slots">{SLOTS.map(t => {
            const off = taken.includes(t) || past(t)
            return <button key={t} disabled={off} className={'slot' + (t === time ? ' on' : '')} onClick={() => setTime(t)}>{t}</button>
          })}</div></div>
        <label>Phone number<input type="tel" placeholder="So the provider can reach you" value={phone} onChange={e => setPhone(e.target.value)} /></label>
        <label>Address<input placeholder="Where should they come?" value={address} onChange={e => setAddress(e.target.value)} /></label>
        <label>Notes (optional)<textarea rows={3} placeholder="Anything the provider should know" value={notes} onChange={e => setNotes(e.target.value)} /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn full" onClick={confirm} disabled={busy}>{busy ? 'Booking…' : 'Confirm booking'}</button>
      </div>
    </>
  )
}
