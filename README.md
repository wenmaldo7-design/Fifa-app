# FIFA Players App — XAcademy Challenge

Aplicación web desarrollada para el challenge técnico de XAcademy.  
Permite explorar, gestionar y analizar jugadores de FIFA (masculinos y femeninos) con autenticación JWT, análisis con IA y diseño responsive.

---

## Funcionalidades

### Jugadores
- Listado paginado con fotos, posición y overall
- Toggle **Masculino / Femenino** para cambiar el dataset
- Filtros por nombre, club, posición y nacionalidad
- Ver detalle completo al hacer click en un jugador
- Crear, editar y eliminar jugadores
- Importar jugadores desde CSV (con deduplicación automática por versión FIFA)
- Exportar listado filtrado a CSV

### Modal de jugador — tres tabs
| Tab | Contenido |
|-----|-----------|
| **Info** | Club, nacionalidad, posición — editable en línea |
| **Skills** | Barras de estadísticas + Radar Chart (Chart.js) |
| **Evolución** | Historial por versión FIFA + análisis narrativo con IA |

### Análisis con IA
- Usa **Groq API (llama-3.1-8b-instant)** para generar un párrafo narrativo sobre la evolución del jugador a lo largo de las versiones FIFA
- El prompt detecta el género y usa lenguaje apropiado en español

### UI / UX
- **Dark mode** con persistencia en localStorage
- **Diseño responsive**: en móvil las filas de la tabla se convierten en tarjetas
- Paginación simplificada en pantallas pequeñas (`Pág. X / Y`)
- Fotos de jugadores desde sofifa.com con fallback a ícono

---

## Tecnologías

| Capa | Stack |
|------|-------|
| Frontend | Angular 21 · TypeScript · SCSS · Chart.js |
| Backend | NestJS · Sequelize · JWT (Passport) |
| Base de datos | MySQL |
| IA | Groq API — llama-3.1-8b-instant |
| DevOps | Docker · Docker Compose |

---

## Cómo correr el proyecto

### Requisitos
- Docker y Docker Compose
- Node.js (solo para el frontend en desarrollo)

### Backend + Base de datos

Desde la raíz del proyecto:

```bash
docker compose up --build
```

El backend queda disponible en `http://localhost:3000`  
La documentación Swagger en `http://localhost:3000/api`

### Frontend (desarrollo)

```bash
cd frontend
npm install
npm start
```

Disponible en `http://localhost:4200`

> El frontend no está dockerizado para desarrollo — usar `npm start` directamente.

---

## Variables de entorno

El backend requiere un archivo `.env` en `/backend`:

```env
GROQ_API_KEY=tu_clave_de_groq
JWT_SECRET=tu_secreto_jwt
DB_HOST=db
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=fifa
```

---

## Endpoints principales

### Auth
```http
POST /auth/login
POST /auth/register
```

### Players
```http
GET    /players                  # Listado paginado con filtros
GET    /players/:id
POST   /players                  # Crear jugador
PUT    /players/:id
DELETE /players/:id
GET    /players/export/csv       # Exportar a CSV
POST   /players/import/csv       # Importar desde CSV
GET    /players/timeline/search  # Historial por versiones FIFA
POST   /players/timeline/analyze # Análisis con IA
```

**Parámetros de filtro disponibles:** `name`, `club`, `position`, `nationality`, `gender`, `page`, `limit`

---

## Decisiones técnicas

- **Angular Signals** para `players`, `total` y `loading` — evita problemas de detección de cambios con Zone.js en callbacks HTTP
- **Standalone components** en Angular, sin NgModules
- **Sequelize** como ORM; los cambios de esquema se aplican con `ALTER TABLE` manual ya que `synchronize: true` no modifica tablas existentes
- **Deduplicación en importación CSV**: el dataset femenino tiene múltiples filas por jugador por versión (una por parche). Se conserva solo la fila con el `fifa_update` más alto por clave `(short_name, fifa_version)`
- **Fotos de jugadores**: se usa `referrerpolicy="no-referrer"` para evitar el bloqueo de hotlinking del CDN de sofifa.com
- Arquitectura **REST** con separación clara frontend / backend

---

## Autor

Wenceslao Maldonado
