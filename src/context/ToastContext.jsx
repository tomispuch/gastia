import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] flex flex-col gap-2 items-center pointer-events-none">
          {toasts.map(t => (
            <div
              key={t.id}
              className="pointer-events-auto card-dark px-4 py-3 flex items-center gap-2.5 rounded-2xl shadow-2xl whitespace-nowrap"
              style={{ animation: 'toastIn 0.25s ease-out' }}
            >
              <span className="text-base">
                {t.type === 'error' ? '❌' : '✅'}
              </span>
              <span className="text-white text-sm font-medium">{t.message}</span>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
