import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('customer')
  const [profile, setProfile] = useState(null) // provider business profile
  const [loading, setLoading] = useState(true)

  const load = useCallback(async u => {
    if (!u) { setRole('customer'); setProfile(null); return }
    try {
      const [ud, pd] = await Promise.all([getDoc(doc(db, 'users', u.uid)), getDoc(doc(db, 'providers', u.uid))])
      setRole(ud.exists() && ud.data().role === 'provider' ? 'provider' : 'customer')
      setProfile(pd.exists() ? { id: pd.id, ...pd.data() } : null)
    } catch { setRole('customer'); setProfile(null) }
  }, [])

  useEffect(() => onAuthStateChanged(auth, async u => { setUser(u); await load(u); setLoading(false) }), [load])
  const reload = () => load(auth.currentUser)

  return <Ctx.Provider value={{ user, role, profile, loading, reload, logout: () => signOut(auth) }}>{children}</Ctx.Provider>
}
