# FinanzasMundo - Documentación

## Descripción del Proyecto

Aplicación fullstack sobre economía y finanzas globales que incluye:

- **Divisas**: Intercambio de monedas a nivel mundial
- **Inflación**: Tasas de inflación por país
- **Mercado de Valores**: Bolsas internacionales
- **Trading**: Estrategias de inversión
- **Entidades Bancarias**: Bancos globales
- **Mentes Brillantes**: Biografías de inversores famosos

## Estructura del Proyecto

```
finanzasmundo/
├── backend/              # API Express
│   ├── server/          # Servidor Express
│   │   ├── server.js    # Archivo principal del servidor
│   │   └── data/        # Base de datos JSON
│   │       ├── divisas.json
│   │       ├── inflacion.json
│   │       ├── mercados.json
│   │       ├── trading.json
│   │       ├── bancos.json
│   │       └── genios.json
│   └── package.json     # Dependencias del backend
├── frontend/            # Aplicación React
│   ├── src/            # Código fuente React
│   │   ├── App.jsx     # Componente principal
│   │   ├── App.css     # Estilos
│   │   ├── Dashboard.jsx # Componente de dashboard
│   │   └── main.jsx    # Punto de entrada
│   ├── public/          # Archivos estáticos
│   ├── index.html       # HTML principal
│   ├── vite.config.js  # Configuración de Vite
│   └── package.json    # Dependencias del frontend
├── docs/               # Documentación
├── .github/            # Configuración de GitHub
│   └── workflows/      # GitHub Actions
├── .gitignore          # Archivos ignorados por Git
├── package.json        # Scripts del monorepo
└── README.md           # Documentación principal
```

## Tecnologías

### Backend
- **Node.js**: Runtime de JavaScript
- **Express**: Framework web
- **CORS**: Habilita跨-origin requests
- **JSON**: Base de datos en archivos

### Frontend
- **React**: Framework de UI
- **Vite**: Herramienta de build
- **Recharts**: Librería de gráficos
- **CSS**: Estilos personalizados

## Instalación

### Instalar todas las dependencias:
```bash
npm run install:all
```

### Instalar solo backend:
```bash
cd backend
npm install
```

### Instalar solo frontend:
```bash
cd frontend
npm install
```

## Ejecución

### Ejecutar todo (backend + frontend):
```bash
npm run dev
```

### Ejecutar solo backend:
```bash
npm run dev:backend
```

### Ejecutar solo frontend:
```bash
npm run dev:frontend
```

## API Endpoints

### GET /api/divisas
Obtener todas las divisas

### GET /api/divisas/:id
Obtener una divisa específica

### GET /api/inflacion
Obtener datos de inflación

### GET /api/mercados
Obtener mercados de valores

### GET /api/trading
Obtener tipos de trading

### GET /api/bancos
Obtener entidades bancarias

### GET /api/genios
Obtener todos los genios

### GET /api/genios/:id
Obtener un genio específico

### GET /api/stats
Obtener estadísticas del dashboard

## Desarrollo

### Backend
El backend corre en el puerto 3001
- Archivo principal: `backend/server/server.js`
- Datos: `backend/server/data/`

### Frontend
El frontend corre en el puerto 5173
- Archivo principal: `frontend/src/App.jsx`
- Configuración: `frontend/vite.config.js`

## Build

### Crear build de producción:
```bash
npm run build
```

## Autor

Juan Felipe Hoy

## Licencia

MIT
