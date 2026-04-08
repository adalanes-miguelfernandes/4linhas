import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { session } = useAuth()
  const [name, setName] = useState(null)

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from('users')
        .select('name')
        .eq('id', session.user.id)
        .single()

      if (data) setName(data.name)
    }

    fetchProfile()
  }, [session])

  return (
    <main>
      <h1>Olá, {name ?? '...'}</h1>
    </main>
  )
}
