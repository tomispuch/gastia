# Arquitectura del proyecto — Gestor de Gastos

## Estructura general

```
d:/GastIA/
├── .env                  → variables de entorno (credenciales)
├── index.html            → punto de entrada HTML (como el index de un war)
├── public/               → archivos estáticos (logos, manifest PWA)
└── src/
    ├── main.jsx          → arranca la app (como el main() de Java)
    ├── App.jsx           → router principal (como un DispatcherServlet)
    ├── index.css         → estilos globales
    ├── lib/
    │   └── supabase.js   → cliente de base de datos (como un DataSource)
    ├── hooks/            → lógica reutilizable (como Services en Spring)
    │   ├── useAuth.js    → maneja la sesión del usuario
    │   └── usePlan.js    → lee el plan del usuario (gratis/pro)
    ├── components/
    │   └── Layout.jsx    → navbar + estructura visual compartida
    └── pages/            → cada pantalla (como Controllers en Spring MVC)
        ├── Login.jsx
        ├── Registro.jsx
        ├── CargarMovimiento.jsx
        ├── Historial.jsx
        ├── Dashboard.jsx
        ├── Presupuestos.jsx
        └── Configuracion.jsx
```

---

## Analogía con Java/Spring

| React               | Java/Spring                                    |
|---------------------|------------------------------------------------|
| `main.jsx`          | `main()` — arranca todo                        |
| `App.jsx`           | `DispatcherServlet` — rutea URLs               |
| `pages/*.jsx`       | `@Controller` — cada pantalla                  |
| `hooks/useAuth.js`  | `@Service` — lógica de sesión                  |
| `hooks/usePlan.js`  | `@Service` — lógica de plan                    |
| `lib/supabase.js`   | `DataSource` / `EntityManager`                 |
| `useState`          | variable de instancia con setter               |
| `useEffect`         | bloque que corre al cargar (como `@PostConstruct`) |

---

## Flujo de una pantalla típica

Tomemos `Historial.jsx` como ejemplo. En Java sería algo así:

```java
// Spring Controller
@GetMapping("/historial")
public List<Movimiento> getHistorial(@RequestParam String userId) {
    return gastoRepo.findByUserId(userId); // consulta a DB
}
```

En React es lo mismo pero todo en un archivo:

```
1. El componente se "monta" (usuario navega a /historial)
2. useEffect se dispara → consulta Supabase (como un repo.findAll())
3. Los datos llegan → useState los guarda (como un campo de la clase)
4. React re-renderiza con los datos nuevos (como responder el request)
```

---

## Flujo de autenticación

```
Usuario abre la app
       ↓
App.jsx pregunta a useAuth: "¿hay sesión?"
       ↓
useAuth consulta Supabase (token guardado en el browser)
       ↓
   Sí → usePlan lee el plan del usuario
           ↓
         Pro → redirige a /dashboard
         Gratis → redirige a /historial
   No → redirige a /login
```

---

## Dónde está cada cosa importante

**¿Quiero cambiar algo visual de una pantalla?**
→ `src/pages/NombrePantalla.jsx`

**¿Quiero cambiar la barra de navegación?**
→ `src/components/Layout.jsx`

**¿Quiero agregar una consulta a la base de datos?**
→ Dentro de la page correspondiente, usando `supabase.from('tabla').select()`

**¿Quiero cambiar qué puede hacer cada plan?**
→ `src/hooks/usePlan.js` + la condición `if (plan !== 'pro')` en cada page

**¿Quiero conectar N8N?**
→ `src/pages/CargarMovimiento.jsx` — hay un bloque con el mock, se reemplaza por el fetch real

**¿Credenciales de Supabase o N8N?**
→ `.env` en la raíz

---

## Una cosa clave diferente a Java

En Java el servidor procesa y devuelve HTML. Acá **no hay servidor propio** — React corre 100% en el browser del usuario. Supabase es la base de datos y hace de backend. N8N hace de procesador de lenguaje natural. La app solo conecta las dos cosas.
