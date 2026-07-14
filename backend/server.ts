import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'clave_secreta_examen_final';
const dbPath = path.join(process.cwd(), 'backend', 'database.json');

const leerBD = (): any[] => {
  if (!fs.existsSync(dbPath)) {
    const inicial = [];
    fs.writeFileSync(dbPath, JSON.stringify(inicial, null, 2));
    return inicial;
  }
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
};

const guardarBD = (datos: any[]) => {
  fs.writeFileSync(dbPath, JSON.stringify(datos, null, 2));
};

// --- 1. ENDPOINT DE LOGIN (Generación de JWT) ---
app.post('/api/login', (req: Request, res: Response): any => {
  const { username, password } = req.body;
  // Credenciales hardcodeadas para la demostración del examen
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ rol: 'administrador' }, SECRET_KEY, { expiresIn: '2h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Credenciales inválidas' });
});

// --- 2. MIDDLEWARE DE SEGURIDAD JWT ---
const verificarToken = (req: Request, res: Response, next: NextFunction): any => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrae el token del formato "Bearer TOKEN"
  
  if (!token) return res.status(403).json({ error: 'Acceso denegado. Token requerido.' });
  
  jwt.verify(token, SECRET_KEY, (err) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado.' });
    next();
  });
};

// --- ENDPOINTS PÚBLICOS (Cualquiera puede ver o reportar) ---
app.get('/api/incidencias', (req: Request, res: Response) => {
  res.json(leerBD());
});

app.post('/api/incidencias', (req: Request, res: Response) => {
  const incidencias = leerBD();
  const maxId = incidencias.length > 0 ? Math.max(...incidencias.map((i: any) => i.id)) : 0;
  const nueva = { id: maxId + 1, fechaCreacion: new Date().toISOString(), ...req.body };
  
  incidencias.push(nueva);
  guardarBD(incidencias);
  res.status(201).json(nueva);
});

// --- ENDPOINTS PROTEGIDOS (Solo Administradores con JWT) ---
app.put('/api/incidencias/:id', verificarToken, (req: Request, res: Response) => {
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

app.delete('/api/incidencias/:id', verificarToken, (req: Request, res: Response) => {
  let incidencias = leerBD();
  incidencias = incidencias.filter(i => i.id !== parseInt(req.params.id));
  guardarBD(incidencias);
  res.status(204).send();
});

app.listen(3000, () => console.log('Backend Seguro corriendo en puerto 3000'));