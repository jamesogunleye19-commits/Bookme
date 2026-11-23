import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { SERVICES, SEED_PROVIDERS, money } from '../data'

export default function Providers() {
  const { sid } = useParams()
  const nav = useNavigate()
  const svc = SERVICES.find(s => s.id === sid)
  const [list, setList] = useState(null)

  useEffect(() => {
    getDocs(query(collection(db, 'providers'), where('serviceId', '==', sid)))
      .then(s => { const r = s.docs.map(d => ({ id: d.id, ...d.data() })); setList(r.length ? r.filter(p => p.available !== false) : SEED_PROVIDERS.filter(p => p.serviceId === sid)) })
      .catch(() => setList(SEED_PROVIDERS.filter(p => p.serviceId === sid)))
  }, [sid])

  return (
    <>
      <header className="top row"><button className="back" onClick={() => nav(-1)}>‹</button><h1>{svc?.icon} {svc?.name}</h1></header>
      {!list ? <div className="center"><div className="spinner" /></div> : (
        <div className="stack">
          {list.map(p => (
            <article className="card" key={p.id}>
              <div className="avatar">{p.name[0]}</div>
              <div className="grow">
                <b>{p.name}</b>
                <p className="muted">⭐ {p.rating} ({p.reviews}) · {p.location}</p>
                <p className="muted">From {money(p.price)}</p>
              </div>
              <Link className="btn sm" to={`/book/${p.id}`} state={{ provider: p }}>Book</Link>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
