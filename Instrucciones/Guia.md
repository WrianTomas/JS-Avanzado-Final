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
