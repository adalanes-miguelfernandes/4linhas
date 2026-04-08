import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Olá, <span className="text-foreground font-medium">{name ?? '...'}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
