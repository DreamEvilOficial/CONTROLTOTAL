# Casino Platform

Plataforma de gestión de usuarios y agentes para casino, construida con Next.js 14, Tailwind CSS y Prisma (SQLite).

## Requisitos

- Node.js 18+
- npm

## Instalación

1.  Clonar el repositorio
2.  Instalar dependencias:

    ```bash
    npm install
    ```

## Configuración de Base de Datos

El proyecto utiliza una base de datos interna SQLite (`dev.db`).

1.  Inicializar la base de datos y crear el usuario administrador:

    ```bash
    npm run db:setup
    ```

    Esto ejecutará las migraciones y creará un usuario admin por defecto:
    - **Email:** `admin@casino.com`
    - **Password:** `admin123`

## Ejecución

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Funcionalidades

- **Roles:** Admin, Agente, Jugador
- **Admin:** Gestión de agentes, CVUs, estadísticas.
- **Agente:** Gestión de jugadores, transacciones, chat.
- **Jugador:** Depósitos, retiros, historial, chat.
- **Chat:** Sistema integrado para coordinar depósitos.

## Despliegue en Vercel

**IMPORTANTE:** Este proyecto usa SQLite (`dev.db`), que es un archivo local.
En plataformas Serverless como Vercel, el sistema de archivos es efímero. Esto significa que **perderás los datos** cada vez que hagas un nuevo despliegue.

Para producción en Vercel, se recomienda cambiar el proveedor de base de datos a Postgres o MySQL (ej. Vercel Postgres, Supabase, PlanetScale).

### Pasos para cambiar a Postgres (Producción):

1.  Actualizar `prisma/schema.prisma`:
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```
2.  Configurar la variable de entorno `DATABASE_URL` en Vercel.
3.  Ejecutar `npx prisma db push` o configurar el comando de build.
