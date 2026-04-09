import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function GroupDetail() {
  const { id } = useParams()
  const { session } = useAuth()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchGroup() {
      const [{ data: groupData }, { data: membersData }] = await Promise.all([
        supabase.from('groups').select('*').eq('id', id).single(),
        supabase
          .from('group_members')
          .select('role, users(id, name)')
          .eq('group_id', id),
      ])

      if (!groupData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setGroup(groupData)
      setMembers(membersData ?? [])
      setLoading(false)
    }

    fetchGroup()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">A carregar...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="py-10">
            <p className="text-muted-foreground mb-4">Grupo não encontrado.</p>
            <Button asChild>
              <Link to="/groups">Voltar aos grupos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const captain = members.find(m => m.role === 'captain')
  const isCurrentUserCaptain = captain?.users?.id === session.user.id

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
            <Link to="/groups">← Grupos</Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">{group.name}</h1>
            {isCurrentUserCaptain && <Badge variant="secondary">Capitão</Badge>}
          </div>
          {group.description && (
            <p className="text-muted-foreground mt-1">{group.description}</p>
          )}
          {group.play_days?.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Jogam à{group.play_days.length === 1 ? '' : 's'}: {group.play_days.join(', ')}
            </p>
          )}
        </div>

        <Separator className="mb-6" />

        <div>
          <h2 className="text-lg font-medium mb-3">
            Membros <span className="text-muted-foreground font-normal text-sm">({members.length})</span>
          </h2>
          <div className="flex flex-col gap-2">
            {members.map(({ role, users: user }) => (
              <Card key={user.id}>
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <span className="font-medium">{user.name}</span>
                  {role === 'captain' && (
                    <Badge variant="secondary">Capitão</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
