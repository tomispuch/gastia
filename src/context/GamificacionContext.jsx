import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { LOGROS, NIVELES, getNivel, getPrevMonth, getMonthRange } from '../lib/gamificacion'

const GamificacionContext = createContext(null)

export function useGamificacion() {
  return useContext(GamificacionContext)
}

export function GamificacionProvider({ userId, children }) {
  const [logrosDesbloqueados, setLogrosDesbloqueados] = useState([])
  const [racha, setRacha] = useState({ meses_consecutivos_verde: 0, meses_consecutivos_presupuesto: 0 })
  const [loading, setLoading] = useState(true)
  const [nuevosLogros, setNuevosLogros] = useState([])

  const nivel = getNivel(logrosDesbloqueados.map(l => l.logro_id))

  useEffect(() => {
    if (!userId) return
    fetchEstado()
  }, [userId])

  useEffect(() => {
    if (!userId || loading) return
    verificarMensualSiCorresponde()
  }, [userId, loading])

  async function fetchEstado() {
    const [logrosRes, rachaRes] = await Promise.all([
      supabase.from('logros_usuario').select('*').eq('user_id', userId),
      supabase.from('racha_usuario').select('*').eq('user_id', userId).single(),
    ])
    setLogrosDesbloqueados(logrosRes.data || [])
    if (rachaRes.data) setRacha(rachaRes.data)
    setLoading(false)
  }

  async function desbloquearLogro(logroId) {
    const yaDesbloqueado = logrosDesbloqueados.some(l => l.logro_id === logroId)
    if (yaDesbloqueado) return null
    const { data } = await supabase
      .from('logros_usuario')
      .insert({ user_id: userId, logro_id: logroId })
      .select()
      .single()
    if (data) {
      setLogrosDesbloqueados(prev => [...prev, data])
      const logro = LOGROS.find(l => l.id === logroId)
      return logro
    }
    return null
  }

  async function actualizarRacha(nuevoVerde, nuevoPresupuesto) {
    const rachaExistente = racha?.id
    const nuevaRacha = {
      user_id: userId,
      meses_consecutivos_verde: nuevoVerde,
      meses_consecutivos_presupuesto: nuevoPresupuesto,
      updated_at: new Date().toISOString(),
    }
    if (rachaExistente) {
      await supabase.from('racha_usuario').update(nuevaRacha).eq('id', rachaExistente)
    } else {
      await supabase.from('racha_usuario').insert(nuevaRacha)
    }
    setRacha(prev => ({ ...prev, ...nuevaRacha }))
    return { verde: nuevoVerde, presupuesto: nuevoPresupuesto }
  }

  const verificarPrimerGasto = useCallback(async () => {
    const yaDesbloqueado = logrosDesbloqueados.some(l => l.logro_id === 'primer_gasto')
    if (yaDesbloqueado) return
    const { count } = await supabase
      .from('gastos')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    if (count > 0) {
      const logro = await desbloquearLogro('primer_gasto')
      if (logro) setNuevosLogros(prev => [...prev, logro])
    }
  }, [logrosDesbloqueados, userId])

  async function verificarMensualSiCorresponde() {
    const clave = `gastia_check_${userId}`
    const now = new Date()
    const claveActual = `${now.getFullYear()}-${now.getMonth() + 1}`
    const ultimoCheck = localStorage.getItem(clave)
    if (ultimoCheck === claveActual) return
    localStorage.setItem(clave, claveActual)
    await verificarLogrosMesAnterior()
  }

  async function verificarLogrosMesAnterior() {
    const now = new Date()
    const { year: yearPrev, month: monthPrev } = getPrevMonth(now.getFullYear(), now.getMonth() + 1)
    const { from, to } = getMonthRange(yearPrev, monthPrev)
    const { year: year2, month: month2 } = getPrevMonth(yearPrev, monthPrev)
    const { from: from2, to: to2 } = getMonthRange(year2, month2)

    const [gastosRes, ingresosRes, gastosPrevRes, presupuestosRes] = await Promise.all([
      supabase.from('gastos').select('monto, categoria').eq('user_id', userId).gte('fecha', from).lte('fecha', to),
      supabase.from('ingresos').select('monto').eq('user_id', userId).gte('fecha', from).lte('fecha', to),
      supabase.from('gastos').select('monto').eq('user_id', userId).gte('fecha', from2).lte('fecha', to2),
      supabase.from('presupuestos').select('categoria, limite_mensual').eq('user_id', userId),
    ])

    const gastos = gastosRes.data || []
    const ingresos = ingresosRes.data || []
    const gastosPrev = gastosPrevRes.data || []
    const presupuestos = presupuestosRes.data || []

    const totalGastado = gastos.reduce((a, g) => a + Number(g.monto), 0)
    const totalIngresado = ingresos.reduce((a, i) => a + Number(i.monto), 0)
    const totalPrev = gastosPrev.reduce((a, g) => a + Number(g.monto), 0)
    const mesVerde = totalIngresado > totalGastado

    const gastosPorCat = gastos.reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.monto)
      return acc
    }, {})
    const presMap = presupuestos.reduce((acc, p) => {
      acc[p.categoria] = p.limite_mensual
      return acc
    }, {})
    const bajoPres = gastos.length > 0 && presupuestos.length > 0 && Object.entries(gastosPorCat).every(([cat, monto]) => {
      return !presMap[cat] || monto <= presMap[cat]
    })

    let nuevoVerde = mesVerde ? (racha.meses_consecutivos_verde || 0) + 1 : 0
    let nuevoPresupuesto = bajoPres ? (racha.meses_consecutivos_presupuesto || 0) + 1 : 0
    await actualizarRacha(nuevoVerde, nuevoPresupuesto)

    const desbloqueados = []
    const checks = [
      { id: 'mes_verde', cond: mesVerde },
      { id: 'bajo_presupuesto', cond: bajoPres },
      { id: 'menos_que_antes', cond: totalPrev > 0 && totalGastado < totalPrev },
      { id: 'racha_3', cond: nuevoVerde >= 3 },
      { id: 'racha_6_presupuesto', cond: nuevoPresupuesto >= 6 },
      { id: 'racha_12', cond: nuevoVerde >= 12 },
    ]

    for (const { id, cond } of checks) {
      if (cond) {
        const logro = await desbloquearLogro(id)
        if (logro) desbloqueados.push(logro)
      }
    }

    if (desbloqueados.length > 0) {
      setNuevosLogros(prev => [...prev, ...desbloqueados])
    }
  }

  function dismissLogro() {
    setNuevosLogros(prev => prev.slice(1))
  }

  return (
    <GamificacionContext.Provider value={{
      logrosDesbloqueados,
      racha,
      nivel,
      loading,
      nuevosLogros,
      dismissLogro,
      verificarPrimerGasto,
    }}>
      {children}
    </GamificacionContext.Provider>
  )
}
