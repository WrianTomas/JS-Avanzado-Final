import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN DE BASE DE DATOS LOCAL ---
const dbPath = path.join(process.cwd(), 'backend', 'database.json');

const leerBD = (): any[] => {
  if (!fs.existsSync(dbPath)) {
    const inicial = [
      { id: 1, tipo: 'Bache en vía', ubicacion: 'Av. Estrella, Santa Clara', estado: 'Pendiente', fechaCreacion: new Date().toISOString() },
      { id: 2, tipo: 'Acumulación de Basura', ubicacion: 'Parque Central', estado: 'Resuelto', fechaCreacion: new Date().toISOString() }
    ];
    fs.writeFileSync(dbPath, JSON.stringify(inicial, null, 2));
    return inicial;
  }
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
};

const guardarBD = (datos: any[]) => {
  fs.writeFileSync(dbPath, JSON.stringify(datos, null, 2));
};

// --- ENDPOINTS (API REST) ---

// OBTENER TODOS (GET)
app.get('/api/incidencias', (req: Request, res: Response) => {
  const incidencias = leerBD();
  res.json(incidencias);
});

// CREAR (POST) - Ahora con IDs limpios y secuenciales
app.post('/api/incidencias', (req: Request, res: Response) => {
  const incidencias = leerBD();

  // Lógica secuencial: Busca el ID más alto y le suma 1
  const maxId = incidencias.length > 0 ? Math.max(...incidencias.map((i: any) => i.id)) : 0;

  const nueva = {
    id: maxId + 1,
    fechaCreacion: new Date().toISOString(), // Guardamos la fecha real de creación
    ...req.body
  };

  incidencias.push(nueva);
  guardarBD(incidencias);

  res.status(201).json(nueva);
});

// ACTUALIZAR (PUT)
app.put('/api/incidencias/:id', (req: Request, res: Response) => {
  const incidencias = leerBD();
  const id = parseInt(req.params.id);
  const index = incidencias.findIndex(i => i.id === id);

  if (index !== -1) {
    incidencias[index] = { ...incidencias[index], ...req.body };
    guardarBD(incidencias);
    res.json(incidencias[index]);
  } else {
    res.status(404).send('No encontrado');
  }
});

// ELIMINAR (DELETE)
app.delete('/api/incidencias/:id', (req: Request, res: Response) => {
  let incidencias = leerBD();
  const id = parseInt(req.params.id);

  incidencias = incidencias.filter(i => i.id !== id);
  guardarBD(incidencias);

  res.status(204).send();
});

app.listen(3000, () => console.log('Backend con Base de Datos Local en puerto 3000'));