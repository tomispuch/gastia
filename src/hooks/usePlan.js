import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePlan(userId) {
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    supabase
      .from('usuarios_config')
      .select('nombre')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        setNombre(data?.nombre ?? '')
        setLoading(false)
      })
  }, [userId])

  return { plan: 'pro', nombre, loading }
}
