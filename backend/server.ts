import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Base de datos en memoria
let incidencias = [
  { id: 1, tipo: 'Bache', ubicacion: 'Av. Estrella, Santa Clara', estado: 'Pendiente' },
  { id: 2, tipo: 'Basura', ubicacion: 'Parque Central', estado: 'Resuelto' }
];

app.get('/api/incidencias', (req: Request, res: Response) => {
  res.json(incidencias);
});

app.post('/api/incidencias', (req: Request, res: Response) => {
  const nueva = { id: Date.now(), ...req.body };
  incidencias.push(nueva);
  res.status(201).json(nueva);
});

// Ruta para actualizar (PUT)
app.put('/api/incidencias/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = incidencias.findIndex(i => i.id === id);
  if (index !== -1) {
    incidencias[index] = { ...incidencias[index], ...req.body };
    res.json(incidencias[index]);
  } else {
    res.status(404).send('No encontrado');
  }
});

// Ruta para eliminar (DELETE)
app.delete('/api/incidencias/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  incidencias = incidencias.filter(i => i.id !== id);
  res.status(204).send();
});

app.listen(3000, () => console.log('Backend completo corriendo en puerto 3000'));