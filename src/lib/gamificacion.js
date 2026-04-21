export const LOGROS = [
  {
    id: 'primer_gasto',
    nombre: 'Primer paso',
    descripcion: 'Registraste tu primer movimiento',
    emoji: '👶',
    condicion: 'Registrar el primer gasto o ingreso',
  },
  {
    id: 'mes_verde',
    nombre: 'Mes en verde',
    descripcion: 'Cerraste un mes con balance positivo',
    emoji: '🏆',
    condicion: 'Ingresos > Gastos al cierre del mes',
  },
  {
    id: 'bajo_presupuesto',
    nombre: 'Bajo presupuesto',
    descripcion: 'Cerraste un mes sin superar ninguna categoría',
    emoji: '💰',
    condicion: 'Ninguna categoría superó su límite en el mes',
  },
  {
    id: 'menos_que_antes',
    nombre: 'Mejorando',
    descripcion: 'Gastaste menos que el mes anterior',
    emoji: '📉',
    condicion: 'Total gastos del mes < total gastos mes anterior',
  },
  {
    id: 'racha_3',
    nombre: 'Consistente',
    descripcion: '3 meses seguidos con balance positivo',
    emoji: '🔄',
    condicion: '3 meses consecutivos con balance positivo',
  },
  {
    id: 'racha_6_presupuesto',
    nombre: 'Maestro del presupuesto',
    descripcion: '6 meses seguidos sin superar el presupuesto',
    emoji: '👑',
    condicion: '6 meses consecutivos sin superar el presupuesto',
  },
  {
    id: 'racha_12',
    nombre: 'Maestro Financiero',
    descripcion: '12 meses consecutivos con balance positivo',
    emoji: '🧠',
    condicion: '12 meses consecutivos con balance positivo',
  },
]

export const NIVELES = [
  { nivel: 1, nombre: 'Aprendiz',           emoji: '🌱', logroReq: null,                  rachaReq: null },
  { nivel: 2, nombre: 'Ordenado',           emoji: '📋', logroReq: 'mes_verde',            rachaReq: null },
  { nivel: 3, nombre: 'Consciente',         emoji: '💡', logroReq: 'racha_3',              rachaReq: { campo: 'meses_consecutivos_verde', meta: 3 } },
  { nivel: 4, nombre: 'Experto',            emoji: '⭐', logroReq: 'racha_6_presupuesto',  rachaReq: { campo: 'meses_consecutivos_presupuesto', meta: 6 } },
  { nivel: 5, nombre: 'Maestro Financiero', emoji: '🏅', logroReq: 'racha_12',             rachaReq: { campo: 'meses_consecutivos_verde', meta: 12 } },
]

export function getNivel(logrosIds) {
  let nivel = NIVELES[0]
  for (const n of NIVELES) {
    if (n.logroReq && logrosIds.includes(n.logroReq)) nivel = n
    else if (!n.logroReq) nivel = n
  }
  return nivel
}

export function getProgresoHaciaNextNivel(nivelActual, logrosIds, racha) {
  const nextIdx = NIVELES.findIndex(n => n.nivel === nivelActual.nivel) + 1
  if (nextIdx >= NIVELES.length) return { pct: 100, label: '¡Nivel máximo!' }
  const next = NIVELES[nextIdx]
  if (next.rachaReq) {
    const actual = racha?.[next.rachaReq.campo] || 0
    const meta = next.rachaReq.meta
    return {
      pct: Math.min(Math.round((actual / meta) * 100), 100),
      label: `${actual} / ${meta} meses`,
    }
  }
  return { pct: logrosIds.includes(next.logroReq) ? 100 : 0, label: next.logroReq ? `Desbloqueá "${LOGROS.find(l => l.id === next.logroReq)?.nombre}"` : '' }
}

export function getPrevMonth(year, month) {
  if (month === 1) return { year: year - 1, month: 12 }
  return { year, month: month - 1 }
}

export function getMonthRange(year, month) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
  return { from, to }
}
