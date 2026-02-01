# 📦 TodoKits - Sistema de Gestión de Préstamos y Recursos

Sistema web completo para la gestión de préstamos de recursos educativos con funcionalidades para administradores y docentes.

## 🛠️ Tecnologías

### Backend
- **Node.js** con Express 5
- **MongoDB** con Mongoose
- **JWT** para autenticación
- **Cloudinary** para almacenamiento de imágenes
- **Pusher** para notificaciones en tiempo real
- **Nodemailer** para envío de correos
- **Socket.io** para chat en tiempo real
- **Zod** para validación de esquemas

### Frontend
- **React 18** con Vite
- **Tailwind CSS 4** para estilos
- **Zustand** para manejo de estado
- **React Hook Form** + Zod para formularios
- **React Router 7** para navegación
- **Pusher JS** para notificaciones en tiempo real
- **Socket.io Client** para chat

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** (versión 18 o superior)
- **MongoDB** (local o en la nube como MongoDB Atlas)
- **npm** o **yarn**

---

## ⚙️ Configuración del Backend

### 1. Navegar a la carpeta del backend

```bash
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `backend/` basándote en el archivo `.env.example`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Puerto del servidor
PORT=3000

# Base de datos MongoDB
MONGODB_URI_LOCAL=mongodb://localhost:27017/todokits

# Configuración de correo (Gmail u otro servicio SMTP)
HOST_MAILTRAP=smtp.gmail.com
PORT_MAILTRAP=465
USER_MAILTRAP=tu-correo@gmail.com
PASS_MAILTRAP=tu-contraseña-de-aplicacion

# URLs del proyecto
URL_BACKEND=http://localhost:3000
URL_FRONTEND=http://localhost:5173

# Clave secreta para JWT
JWT_SECRET=tu-clave-secreta-super-segura

# Cloudinary (para subir imágenes)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Pusher (para notificaciones en tiempo real)
PUSHER_APP_ID=tu-app-id
PUSHER_KEY=tu-pusher-key
PUSHER_SECRET=tu-pusher-secret
PUSHER_CLUSTER=tu-cluster

# Clave de encriptación (64 caracteres hexadecimales)
ENCRYPTION_KEY=tu-clave-de-64-caracteres-hexadecimales-aqui-ejemplo123456789
```

### 4. Ejecutar el backend

**Modo desarrollo (con hot-reload):**

```bash
npm run dev
```

**Modo producción:**

```bash
npm start
```

El backend estará disponible en: `http://localhost:3000`

---

## 🎨 Configuración del Frontend

### 1. Navegar a la carpeta del frontend

```bash
cd frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `frontend/`:

```env
# URL del backend
VITE_BACKEND_URL=http://localhost:3000

# Pusher (para notificaciones en tiempo real)
VITE_PUSHER_KEY=tu-pusher-key
VITE_PUSHER_CLUSTER=tu-cluster

# HuggingFace API (opcional, para procesamiento de imágenes)
VITE_HUGGINGFACE_API_KEY=tu-api-key
```

### 4. Ejecutar el frontend

**Modo desarrollo:**

```bash
npm run dev
```

**Build para producción:**

```bash
npm run build
```

**Preview del build:**

```bash
npm run preview
```

El frontend estará disponible en: `http://localhost:5173`

---

## 🏃‍♂️ Ejecución Rápida (Resumen)

### Terminal 1 - Backend

```bash
cd backend
npm install
# Configurar .env (copiar de .env.example y editar)
npm run dev
```

### Terminal 2 - Frontend

```bash
cd frontend
npm install
# Crear archivo .env con las variables necesarias
npm run dev
```

---

## 📋 Scripts Disponibles

### Backend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor en modo desarrollo con hot-reload |
| `npm start` | Inicia el servidor en modo producción |
| `npm test` | Ejecuta todos los tests |
| `npm run test:watch` | Ejecuta tests en modo watch |
| `npm run test:coverage` | Ejecuta tests con reporte de cobertura |
| `npm run test:e2e` | Ejecuta tests end-to-end |
| `npm run test:integration` | Ejecuta tests de integración |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo Vite |
| `npm run build` | Genera el build de producción |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Ejecuta ESLint para verificar el código |

---

## 🔑 Servicios Externos Requeridos

Para que el proyecto funcione completamente, necesitas configurar los siguientes servicios:

### 1. MongoDB
- Puedes usar MongoDB local o [MongoDB Atlas](https://www.mongodb.com/atlas) (nube)

### 2. Cloudinary
- Crea una cuenta en [Cloudinary](https://cloudinary.com/)
- Obtén tus credenciales desde el dashboard

### 3. Pusher
- Crea una cuenta en [Pusher](https://pusher.com/)
- Crea una nueva aplicación de Channels
- Obtén las credenciales (App ID, Key, Secret, Cluster)

### 4. Gmail (para emails)
- Usa una cuenta de Gmail
- Genera una [contraseña de aplicación](https://support.google.com/accounts/answer/185833) para usar con Nodemailer

### 5. HuggingFace (opcional)
- Para funcionalidades de procesamiento de imágenes
- Obtén una API key en [HuggingFace](https://huggingface.co/)

---

## 📁 Estructura del Proyecto

```
todoKits/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración de servicios externos
│   │   ├── controllers/    # Controladores de las rutas
│   │   ├── helpers/        # Funciones auxiliares
│   │   ├── middlewares/    # Middlewares (JWT, validaciones)
│   │   ├── models/         # Modelos de Mongoose
│   │   ├── routers/        # Definición de rutas
│   │   ├── schemas/        # Esquemas de validación Zod
│   │   ├── services/       # Servicios (email, etc.)
│   │   └── test/           # Tests (e2e, integration)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── context/        # Stores de Zustand
│   │   ├── helpers/        # Funciones auxiliares
│   │   ├── hooks/          # Custom hooks
│   │   ├── layout/         # Layouts de la aplicación
│   │   ├── pages/          # Páginas/vistas
│   │   ├── routes/         # Configuración de rutas
│   │   └── schemas/        # Esquemas de validación
│   └── package.json
│
└── README.md
```

---

## 👥 Roles del Sistema

- **Administrador**: Gestión completa de docentes, recursos, préstamos y transferencias
- **Docente**: Visualización de préstamos propios, confirmación de recursos y chat

---

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
- Verifica que MongoDB esté corriendo
- Comprueba que la URI en `.env` sea correcta

### Error de CORS
- Asegúrate de que `URL_FRONTEND` en el backend coincida con la URL del frontend

### Emails no se envían
- Verifica las credenciales de Gmail
- Asegúrate de usar una contraseña de aplicación, no tu contraseña normal

### Notificaciones en tiempo real no funcionan
- Verifica que las credenciales de Pusher sean correctas tanto en backend como frontend

---

## 📄 Licencia

ISC
