import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const DAYS = [
  { value: 'Segunda', id: 'monday' },
  { value: 'Terça', id: 'tuesday' },
  { value: 'Quarta', id: 'wednesday' },
  { value: 'Quinta', id: 'thursday' },
  { value: 'Sexta', id: 'friday' },
  { value: 'Sábado', id: 'saturday' },
  { value: 'Domingo', id: 'sunday' },
]

export default function NewGroup() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [scheduleType, setScheduleType] = useState('fixed')
  const [playDays, setPlayDays] = useState({}) // { 'Segunda': '18:00', ... }
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleScheduleTypeChange(value) {
    setScheduleType(value)
    if (value === 'flexible') setPlayDays({})
  }

  function toggleDay(day) {
    setPlayDays(prev => {
      if (day in prev) {
        const next = { ...prev }
        delete next[day]
        return next
      }
      return { ...prev, [day]: '' }
    })
  }

  function setDayTime(day, time) {
    setPlayDays(prev => ({ ...prev, [day]: time }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name,
        description: description || null,
        schedule_type: scheduleType,
        captain_id: session.user.id,
        play_days: DAYS.filter(d => d.value in playDays).map(d => ({ day: d.value, time: playDays[d.value] })),
      })
      .select('id')
      .single()

    if (groupError) {
      setError(groupError.message)
      setLoading(false)
      return
    }

    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: session.user.id, role: 'captain' })

    if (memberError) {
      setError(memberError.message)
      setLoading(false)
      return
    }

    navigate(`/groups/${group.id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Novo grupo</CardTitle>
          <CardDescription>Cria um grupo para os teus jogos</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome do grupo *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Os Craques do Bairro"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                type="text"
                placeholder="Uma descrição opcional"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <Label>Tipo de horário</Label>
              <RadioGroup value={scheduleType} onValueChange={handleScheduleTypeChange} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed" className="font-normal cursor-pointer">Horário fixo</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="flexible" id="flexible" />
                  <Label htmlFor="flexible" className="font-normal cursor-pointer">Horário livre</Label>
                </div>
              </RadioGroup>
            </div>

            {scheduleType === 'fixed' && (
              <div className="flex flex-col gap-3">
                <Label>Dias em que jogam</Label>
                <div className="flex flex-col gap-2">
                  {DAYS.map(day => (
                    <div key={day.id} className="flex items-center gap-3">
                      <Checkbox
                        id={day.id}
                        checked={day.value in playDays}
                        onCheckedChange={() => toggleDay(day.value)}
                      />
                      <Label htmlFor={day.id} className="w-16 font-normal cursor-pointer">
                        {day.value}
                      </Label>
                      {day.value in playDays && (
                        <Input
                          type="time"
                          className="w-32 h-8 text-sm"
                          value={playDays[day.value]}
                          onChange={e => setDayTime(day.value, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'A criar...' : 'Criar grupo'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" asChild>
              <Link to="/groups">Cancelar</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
