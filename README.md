# 🐎 Jinetes DTI — Guía de Setup y Deploy

## Estructura del proyecto
```
jinetes-dti/
├── frontend/          ← React + Vite
│   ├── public/
│   │   ├── logo.jpg
│   │   ├── card1.jpg  ← 1 sello
│   │   ├── card2.jpg  ← 2 sellos
│   │   ├── ...
│   │   └── card7.jpg  ← 7 sellos (¡premio!)
│   └── src/
└── backend/           ← Node.js + Express
    └── src/
```

---

## PASO 1: Configurar Supabase (base de datos gratis)

1. Ve a https://app.supabase.com y crea una cuenta gratis
2. Crea un nuevo proyecto (guarda la contraseña)
3. Una vez creado, ve a **SQL Editor** y ejecuta esto:

```sql
CREATE TABLE estudiantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  sellos INTEGER DEFAULT 0 CHECK (sellos >= 0 AND sellos <= 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_estudiantes_nombre ON estudiantes USING gin(to_tsvector('spanish', nombre || ' ' || apellido));
CREATE INDEX idx_estudiantes_codigo ON estudiantes (codigo);
```

4. Ve a **Settings → API** y copia:
   - `Project URL` → es tu `SUPABASE_URL`
   - `service_role` key (la secreta) → es tu `SUPABASE_SERVICE_KEY`

---

## PASO 2: Ordenar las imágenes de tarjetas

Las imágenes en `frontend/public/` deben estar nombradas así:
- `card1.jpg` → tarjeta con 1 sello azul
- `card2.jpg` → tarjeta con 2 sellos azules
- `card3.jpg` → tarjeta con 3 sellos azules
- `card4.jpg` → tarjeta con 4 sellos azules
- `card5.jpg` → tarjeta con 5 sellos azules
- `card6.jpg` → tarjeta con 6 sellos azules
- `card7.jpg` → tarjeta con 7 sellos azules (¡completa!)

⚠️ Revisa que estén en el orden correcto contando los sellos azules en cada imagen.

---

## PASO 3: Desarrollo local

### Backend
```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales de Supabase y tu clave admin
npm install
npm run dev
# → API corriendo en http://localhost:3001
```

### Frontend
```bash
cd frontend
# Crea frontend/.env.local:
echo "VITE_API_URL=http://localhost:3001/api" > .env.local
npm install
npm run dev
# → App en http://localhost:5173
```

---

## PASO 4: Deploy gratis en Vercel

### Deploy del Backend

1. Sube el código a GitHub (o GitLab)
2. Ve a https://vercel.com → New Project → importa el repo
3. En la configuración del proyecto:
   - **Root Directory**: `backend`
   - **Framework**: Other
   - **Build Command**: (dejar vacío)
   - **Output Directory**: (dejar vacío)
4. En **Environment Variables** agrega:
   ```
   SUPABASE_URL = https://tu-proyecto.supabase.co
   SUPABASE_SERVICE_KEY = tu-service-role-key
   ADMIN_SECRET_KEY = tu-clave-secreta-admin
   FRONTEND_URL = https://tu-frontend.vercel.app
   ```
5. Deploy → copia la URL del backend (ej: `https://jinetes-backend.vercel.app`)

> ⚠️ Para que Express funcione en Vercel necesitas agregar `vercel.json` en el backend:

```json
{
  "version": 2,
  "builds": [{ "src": "src/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/index.js" }]
}
```

### Deploy del Frontend

1. En Vercel → New Project → mismo repo
2. En la configuración:
   - **Root Directory**: `frontend`
   - **Framework**: Vite
3. En **Environment Variables**:
   ```
   VITE_API_URL = https://jinetes-backend.vercel.app/api
   ```
4. Deploy → ¡listo!

---

## Uso del Panel Admin

1. Ve a `https://tu-app.vercel.app/admin/login`
2. Ingresa tu `ADMIN_SECRET_KEY`
3. Puedes:
   - 📋 Ver todos los estudiantes con sus sellos
   - ➕ Agregar nuevos estudiantes (nombre, apellido, carnet)
   - **+/-** Sumar o restar sellos a cada estudiante
   - 🗑️ Eliminar estudiantes

---

## Acceso para estudiantes

1. Van a `https://tu-app.vercel.app`
2. Escriben su nombre o código de carnet
3. Hacen clic en su nombre
4. Ven su tarjeta con los sellos actualizados

---

## ¿Problemas comunes?

- **CORS error**: Asegúrate que `FRONTEND_URL` en el backend sea exactamente la URL de tu frontend en Vercel
- **401 en admin**: Verifica que `ADMIN_SECRET_KEY` sea igual en backend y en la clave que usas al hacer login
- **Imágenes no cargan**: Verifica que los archivos `card1.jpg` ... `card7.jpg` estén en `frontend/public/`
