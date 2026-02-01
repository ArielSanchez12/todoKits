# 📦 Sistema de kits de los laboratorios de la ESFOT-EPN

Sistema web completo para la gestión de kits con funcionalidades para administrador y docentes.

## 🛠️ Tecnologías

### Backend
- **Node.js** con Express
- **MongoDB** con Mongoose
- **JWT** para autenticación
- **Cloudinary** para almacenamiento de imágenes
- **Pusher Channels** para chat en tiempo real
- **Nodemailer** para envío de correos
- **Zod** para validación de esquemas

### Frontend
- **React** con Vite
- **Tailwind CSS** para estilos
- **Zustand** para manejo de estado
- **React Hook Form** + Zod para formularios
- **React Router** para navegación
- **Pusher Channels** para chat

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** (versión 18 o superior)
- **MongoDB** (local o en la nube como MongoDB Atlas)
- **npm**

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

# Pusher (para chat en tiempo real)
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

# Pusher (para chat)
VITE_PUSHER_KEY=tu-pusher-key
VITE_PUSHER_CLUSTER=tu-cluster

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

---

## 👥 Roles del Sistema

- **Administrador**: Gestión completa de docentes, recursos, préstamos y transferencias
- **Docente**: Visualización de préstamos propios, confirmación de recursos y chat

---

