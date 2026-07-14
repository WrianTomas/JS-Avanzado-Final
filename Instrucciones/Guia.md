El proyecto utiliza una arquitectura Monorepo. Se requieren dos terminales en paralelo:

**1. Levantar el Servidor (Backend)**
Desde la raíz del proyecto, ejecutar:
`npm run start:backend`
*(El servidor se iniciará en el puerto 3000).*

**2. Levantar la Interfaz (Frontend)**
En una segunda terminal, ingresar a la carpeta del frontend y compilar:
`cd frontend-hibrido`
`npm install`
`npm start`
*(El proxy redirigirá las peticiones de React hacia el backend automáticamente).*

**3. Levantar la Interfaz (Next.js)**
En una tercera terminal, ingresar a la carpeta del frontend y compilar:
`cd portal-cuidadano`
`npm install`
`npm install jspdf`
`npm run dev`

**Etapa 7**
Abre la terminal donde corre tu backend (la que ejecutaba npm run start:backend), presiona Ctrl + C para detenerlo, y ejecuta este comando para instalar las herramientas de tokens y sus tipos:
`npm install jsonwebtoken && npm install -D @types/jsonwebtoken`
