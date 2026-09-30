# FinanzasMundo

Plataforma educativa fullstack sobre economía y finanzas globales con datos de fuentes oficiales verificables.

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-brightgreen)
![React](https://img.shields.io/badge/React-19.2-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Descripción

FinanzasMundo es una aplicación web educativa que proporciona información financiera global obtenida exclusivamente de fuentes oficiales y verificables. El proyecto sigue un principio de transparencia total: cada dato numérico incluye su procedencia, fecha de actualización y enlace para auditoría.

### Características

- **Divisas**: Tipos de cambio del Banco Central Europeo (BCE)
- **Inflación**: Tasas de inflación del Banco Mundial
- **Mercados**: Datos de empresas archivados en la SEC (Estados Unidos)
- **Bancos**: Información financiera de entidades bancarias reguladas
- **Trading**: Estrategias educativas y criptomonedas de Coinbase
- **Genios Financieros**: Biografías e historias de inversores destacados

### Principios del Proyecto

- ✅ Solo datos de fuentes oficiales verificables
- ✅ Transparencia total en la procedencia de datos
- ✅ Sistema de caché con fallback a snapshots
- ✅ API RESTful con documentación de endpoints
- ✅ Frontend React moderno con componentes reutilizables

## 🏗️ Estructura del Proyecto

```
finanzasmundo/
├── backend/              # API Express.js
│   ├── server/          # Servidor y lógica de negocio
│   │   ├── data/        # Datos semilla (seed data)
│   │   ├── lib/         # Utilidades (caché, upstream)
│   │   └── sources/     # Integraciones con APIs externas
│   └── package.json
├── frontend/            # Aplicación React + Vite
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── sections/    # Secciones de la aplicación
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilidades
│   └── package.json
├── docs/               # Documentación adicional
├── .github/            # Configuración de GitHub
└── package.json        # Scripts del monorepo
```

## 🚀 Tecnologías

### Backend
- **Node.js** >= 20
- **Express.js** 5.2.1
- **CORS** 2.8.6

### Frontend
- **React** 19.2.8
- **Vite** 8.3.0
- **Recharts** 3.10.1 (Gráficos)
- **oxlint** (Linting)

### Desarrollo
- **concurrently** 8.2.2 (Ejecución paralela)

## 📦 Instalación

### Requisitos Previos

- Node.js >= 20
- npm >= 9

### Pasos de Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd frontone
```

2. Instalar dependencias:
```bash
npm run install:all
```

Este comando instala:
- Dependencias del monorepo
- Dependencias del backend
- Dependencias del frontend

## 🎯 Ejecución

### Modo Desarrollo

```bash
npm run dev
```

Esto iniciará:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5173

### Scripts Disponibles

```bash
# Instalar todas las dependencias
npm run install:all

# Modo desarrollo (backend + frontend)
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend

# Build del frontend
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Verificación completa (lint + build)
npm run check
```

## 📚 Endpoints de la API

### Salud del Sistema
- `GET /api/salud` - Estado del sistema y fuentes
- `GET /api/health` - Alias de /api/salud

### Datos Financieros
- `GET /api/divisas` - Tipos de cambio
- `GET /api/divisas/:id` - Divisa específica
- `GET /api/inflacion` - Tasas de inflación
- `GET /api/mercados` - Bolsas de valores
- `GET /api/bancos` - Entidades bancarias
- `GET /api/trading` - Estrategias y criptomonedas
- `GET /api/genios` - Biografías de inversores
- `GET /api/genios/:id` - Genio específico
- `GET /api/fuentes` - Lista de fuentes de datos
- `GET /api/estado` - Estado de frescura por sección
- `GET /api/stats` - Estadísticas agregadas

## 🔒 Fuentes de Datos

Todas las fuentes son oficiales y verificables:

- **Banco Central Europeo (BCE)**: Tipos de cambio
- **Banco Mundial**: Tasas de inflación
- **SEC (Estados Unidos)**: Datos de empresas públicas
- **Coinbase**: Datos de criptomonedas
- **Reguladores bancarios**: Información financiera

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'Añadir nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

### Pautas de Contribución

- Mantener el principio de datos verificables
- Seguir el estilo de código existente
- Incluir tests para nuevas funcionalidades
- Actualizar la documentación

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👤 Autor

**Juan Felipe Hoy**

## 📞 Soporte

Para reportar issues o sugerencias:
- Abre un issue en el repositorio
- Contacta al mantenedor

## 🙏 Agradecimientos

- Banco Central Europeo por los datos de divisas
- Banco Mundial por los datos de inflación
- SEC por los datos de empresas públicas
- Coinbase por los datos de criptomonedas

---

**Nota**: Este proyecto es educativo y no constituye asesoramiento financiero. Los datos se proporcionan "tal cual" sin garantías de exactitud o idoneidad para ningún propósito en particular.
