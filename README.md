# FIFA Players App - XAcademy Challenge

Aplicación web desarrollada para el challenge técnico de XAcademy.

Permite:

- Login autenticado con JWT
- Listado paginado de jugadores FIFA
- Filtros por nombre, club y posición
- Ver detalle de jugador
- Visualización de skills con Radar Chart
- Crear jugadores
- Editar jugadores
- Eliminar jugadores
- Exportar listado filtrado a CSV

---

# Tecnologías utilizadas

## Frontend
- Angular
- TypeScript
- SCSS
- Chart.js

## Backend
- NestJS
- Sequelize
- JWT Authentication

## Base de datos
- MySQL

## DevOps
- Docker
- Docker Compose

---

# Cómo correr el proyecto

## Requisitos

- Docker
- Docker Compose

---

## Levantar aplicación completa

Desde la raíz del proyecto:

```bash
docker compose up --build
```

---

# Frontend

Disponible en:

```txt
http://localhost:4200
```

---

# Backend

Disponible en:

```txt
http://localhost:3000
```

---

# Funcionalidades implementadas

## Login JWT

Los endpoints del backend están protegidos mediante autenticación JWT.

---

## CRUD de jugadores

- Crear jugador
- Editar jugador
- Eliminar jugador
- Obtener jugador por ID
- Listado paginado

---

## Filtros

Se pueden filtrar jugadores por:

- Nombre
- Club
- Posición

---

## Exportación CSV

Permite descargar el listado filtrado en formato CSV.

---

## Radar Chart

Visualización gráfica de skills del jugador usando Chart.js.

---

# Endpoints principales

## Auth

```http
POST /auth/login
```

---

## Players

```http
GET /players
GET /players/:id
POST /players
PUT /players/:id
DELETE /players/:id
GET /players/export/csv
```

---

# Decisiones técnicas

- Se utilizó Angular standalone components.
- Se implementó autenticación JWT con Passport.
- Se utilizó Sequelize como ORM.
- Se separó frontend y backend mediante arquitectura REST.
- Se dockerizó toda la aplicación para facilitar la ejecución.

---

# Autor

Wenceslao Maldonado