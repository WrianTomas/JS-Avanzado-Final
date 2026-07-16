import React, { useState, useEffect } from 'react';

export const ReactIncidencias = () => {
  // Estados de Autenticación
  const [token, setToken] = useState(localStorage.getItem('jwt_admin') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados de Datos
  const [incidencias, setIncidencias] = useState<any[]>([]);

  useEffect(() => {
    if (token) cargarDatos();
  }, [token]);

  const cargarDatos = () => {
    // ✅ URL ACTUALIZADA
    fetch('https://js-avanzado-final.onrender.com/api/incidencias')
      .then(res => res.json())
      .then(data => setIncidencias(data.sort((a: any, b: any) => b.id - a.id)));
  };

  // Lógica de Login
  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    // ✅ URL ACTUALIZADA
    const res = await fetch('https://js-avanzado-final.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('jwt_admin', data.token); // Persistencia de sesión
    } else {
      alert('Credenciales incorrectas. Pista: admin / admin123');
    }
  };

  const cerrarSesion = () => {
    setToken('');
    localStorage.removeItem('jwt_admin');
  };

  // Peticiones Protegidas enviando el JWT
  const marcarResuelto = async (id: number) => {
    // ✅ URL ACTUALIZADA
    await fetch(`https://js-avanzado-final.onrender.com/api/incidencias/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ estado: 'Resuelto' })
    });
    cargarDatos();
  };

  const eliminarIncidencia = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro del sistema?')) return;
    // ✅ URL ACTUALIZADA
    await fetch(`https://js-avanzado-final.onrender.com/api/incidencias/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    cargarDatos();
  };

  // --- VISTA 1: PANTALLA DE LOGIN ---
  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 20px', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '20px' }}>🔒 Acceso Restringido</h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '30px' }}>Ingresa tus credenciales de administrador para gestionar los reportes ciudadanos.</p>
          <form onSubmit={iniciarSesion} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" placeholder="Usuario (Ej: admin)" value={username} onChange={e => setUsername(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} required 
            />
            <input 
              type="password" placeholder="Contraseña (Ej: admin123)" value={password} onChange={e => setPassword(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} required 
            />
            <button type="submit" style={{ padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}>
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VISTA 2: PANEL DE ADMINISTRACIÓN ---
  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🛡️</span> Centro de Mando Municipal
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Gestión oficial de incidencias ciudadanas</p>
        </div>
        <button onClick={cerrarSesion} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {incidencias.map((inc) => (
          <div key={inc.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: `5px solid ${inc.estado === 'Resuelto' ? '#10b981' : '#f59e0b'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>TICKET #{inc.id}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: inc.estado === 'Resuelto' ? '#059669' : '#b91c1c' }}>{inc.estado}</span>
            </div>
            <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{inc.tipo}</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#475569' }}>📍 {inc.ubicacion}</p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {inc.estado !== 'Resuelto' && (
                <button 
                  onClick={() => marcarResuelto(inc.id)}
                  style={{ flex: 1, padding: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                >
                  ✓ Marcar Resuelto
                </button>
              )}
              <button 
                onClick={() => eliminarIncidencia(inc.id)}
                style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
              >
                🗑️ Eliminar 
              </button>
            </div>
          </div>
        ))}
        {incidencias.length === 0 && <p style={{ color: '#64748b' }}>No hay incidencias registradas en el sistema.</p>}
      </div>
    </div>
  );
};