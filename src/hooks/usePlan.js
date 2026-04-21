import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePlan(userId) {
  const [plan, setPlan] = useState(null)
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    supabase
      .from('usuarios_config')
      .select('plan, nombre')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        setPlan(data?.plan ?? 'gratis')
        setNombre(data?.nombre ?? '')
        setLoading(false)
      })
  }, [userId])

  return { plan, nombre, loading }
}
