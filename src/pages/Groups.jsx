import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Groups() {
  const { session } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGroups() {
      const { data } = await supabase
        .from('group_members')
        .select('role, groups(id, name, description, play_days)')
        .eq('user_id', session.user.id)

      if (data) setGroups(data)
      setLoading(false)
    }

    fetchGroups()
  }, [session])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Os meus grupos</h1>
          <Button asChild>
            <Link to="/groups/new">Criar grupo</Link>
          </Button>
        </div>

        {loading && (
          <p className="text-muted-foreground text-sm">A carregar...</p>
        )}

        {!loading && groups.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">Ainda não pertences a nenhum grupo.</p>
              <Button asChild className="mt-4">
                <Link to="/groups/new">Criar o primeiro grupo</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {groups.map(({ role, groups: group }) => (
            <Link key={group.id} to={`/groups/${group.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    {role === 'captain' && <Badge variant="secondary">Capitão</Badge>}
                  </div>
                  {group.description && (
                    <CardDescription>{group.description}</CardDescription>
                  )}
                </CardHeader>
                {group.play_days?.length > 0 && (
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {group.play_days.join(' · ')}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
