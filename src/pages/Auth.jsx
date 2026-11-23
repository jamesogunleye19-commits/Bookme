import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'
import { useAuth } from '../AuthContext'

const msg = c => ({
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/email-already-in-use': 'That email already has an account. Sign in instead.',
  'auth/weak-password': 'Use a password with at least 6 characters.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/popup-closed-by-user': 'Google sign-in was closed.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
}[c] || 'Something went wrong. Try again.')

export default function Auth() {
  const [params, setParams] = useSearchParams()
  const signup = params.get('mode') === 'signup'
  const [role, setRole] = useState('customer')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const { reload } = useAuth()
  const nav = useNavigate()
  const set = k => e => setF({ ...f, [k]: e.target.value })

  async function finish(u, name, isNew) {
    const ref = doc(db, 'users', u.uid)
    const exists = (await getDoc(ref)).exists()
    if (!exists || isNew) await setDoc(ref, { name: name || u.displayName || '', email: u.email, role, createdAt: serverTimestamp() }, { merge: true })
    await reload()
    const r = (await getDoc(ref)).data()?.role
    nav(r === 'provider' ? '/provider' : '/home')
  }

  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      if (signup) {
        const { user } = await createUserWithEmailAndPassword(auth, f.email, f.password)
        await updateProfile(user, { displayName: f.name })
        await finish(user, f.name, true)
      } else {
        const { user } = await signInWithEmailAndPassword(auth, f.email, f.password)
        await finish(user, '', false)
      }
    } catch (x) { setErr(msg(x.code)) } finally { setBusy(false) }
  }
  async function google() {
    setErr('')
    try { const { user } = await signInWithPopup(auth, googleProvider); await finish(user, '', false) }
    catch (x) { setErr(msg(x.code)) }
  }
  async function reset() {
    if (!f.email) return setErr('Enter your email first, then tap Forgot password.')
    try { const { sendPasswordResetEmail } = await import('firebase/auth'); await sendPasswordResetEmail(auth, f.email); setErr(''); setInfo('Reset link sent. Check your inbox.') }
    catch (x) { setErr(msg(x.code)) }
  }

  return (
    <div className="authwrap">
      <Link to="/" className="back">‹ Back</Link>
      <h1 className="brand sm">Book<span>Me</span></h1>
      <h2>{signup ? 'Create your account' : 'Welcome back'}</h2>
      {signup && (
        <div className="seg" style={{ marginBottom: 14 }}>
          <button type="button" className={role === 'customer' ? 'on' : ''} onClick={() => setRole('customer')}>I need a service</button>
          <button type="button" className={role === 'provider' ? 'on' : ''} onClick={() => setRole('provider')}>I offer a service</button>
        </div>
      )}
      <form onSubmit={submit} className="form">
        {signup && <input placeholder="Full name" value={f.name} onChange={set('name')} required />}
        <input type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
        <input type="password" placeholder="Password" value={f.password} onChange={set('password')} required minLength={6} />
        {err && <p className="err">{err}</p>}
        {info && <p className="ok">{info}</p>}
        <button className="btn full" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button>
        {!signup && <button type="button" className="link plain" onClick={reset}>Forgot password?</button>}
      </form>
      <div className="or"><span>or</span></div>
      <button className="btn ghost full" onClick={google}>Continue with Google</button>
      <p className="switch">
        {signup ? 'Already have an account?' : 'New to BookMe?'}{' '}
        <button onClick={() => setParams({ mode: signup ? 'signin' : 'signup' })}>{signup ? 'Sign in' : 'Get started'}</button>
      </p>
    </div>
  )
}
