import React, { useState, useEffect } from 'react';

export const ReactIncidencias = () => {
  // Estados de Seguridad
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ email: '', password: '' });

  // Estados de la App
  const [vista, setVista] = useState('gestion');
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  
  const [form, setForm] = useState({ id: null, tipo: 'Bache', ubicacion: '', estado: 'Pendiente' });

  const cargarDatos = () => {
    fetch('/api/incidencias').then(res => res.json()).then(data => setIncidencias(data));
  };

  useEffect(() => {
    if (isLoggedIn) cargarDatos();
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.email && user.password) setIsLoggedIn(true);
    else alert('Ingrese sus credenciales de administrador');
  };

  const guardar = () => {
    if (!form.ubicacion) return alert('La ubicación es obligatoria');
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/incidencias/${form.id}` : '/api/incidencias';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: form.tipo, ubicacion: form.ubicacion, estado: form.estado })
    }).then(() => {
      setForm({ id: null, tipo: 'Bache', ubicacion: '', estado: 'Pendiente' });
      cargarDatos();
    });
  };

  const eliminar = (id: number) => {
    if(window.confirm('¿Eliminar este reporte definitivamente?')) {
      fetch(`/api/incidencias/${id}`, { method: 'DELETE' }).then(() => cargarDatos());
    }
  };

  const getBadgeClass = (estado: string) => {
    if (estado === 'Resuelto') return 'badge badge-resuelto';
    if (estado === 'En Proceso') return 'badge badge-proceso';
    return 'badge badge-pendiente';
  };

  // Filtrador en vivo
  const incidenciasFiltradas = incidencias.filter(inc => 
    inc.ubicacion.toLowerCase().includes(filtroBusqueda.toLowerCase()) || 
    inc.tipo.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  // --- PANTALLA DE LOGIN REFINADA ---
  if (!isLoggedIn) {
    return (
      <div className="card card-login">
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏙️</div>
        <h2 style={{ color: 'var(--primary)', marginBottom: '5px' }}>GeoReporte</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem' }}>
          Portal Administrativo - Accesibilidad Urbana
        </p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input 
              type="email" 
              className="form-control" 
              placeholder="Correo institucional" 
              value={user.email}
              onChange={e => setUser({...user, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              className="form-control" 
              placeholder="Contraseña" 
              value={user.password}
              onChange={e => setUser({...user, password: e.target.value})}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Iniciar Sesión Segura
          </button>
        </form>
      </div>
    );
  }

  // Cálculos para Estadísticas
  const resueltos = incidencias.filter(i => i.estado === 'Resuelto').length;
  const pendientes = incidencias.filter(i => i.estado === 'Pendiente').length;

  // --- DASHBOARD PRINCIPAL ---
  return (
    <div className="container">
      <div className="card">
        <div className="header-panel">
          <div className="header-title">
            <span style={{ fontSize: '2rem' }}>🏙️</span>
            <div>
              <h2 style={{ margin: 0, color: 'var(--text-main)' }}>GeoReporte</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Módulo de Incidencias Urbanas</span>
            </div>
          </div>
          <div className="tabs-group">
            <button className={`btn ${vista === 'gestion' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setVista('gestion')}>
              📋 Gestión
            </button>
            <button className={`btn ${vista === 'estadisticas' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setVista('estadisticas')}>
              📊 Análisis
            </button>
            <button className="btn btn-outline" onClick={() => setIsLoggedIn(false)}>
              🚪 Salir
            </button>
          </div>
        </div>

        {vista === 'gestion' && (
          <div className="grid-gestion">
            {/* Formulario Lateral */}
            <div>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>
                  {form.id ? '✏️ Modo Edición' : '📝 Registrar Evento'}
                </h4>
                
                <div className="form-group">
                  <label className="form-label">Clasificación</label>
                  <select className="form-control" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                    <option>Bache en vía</option>
                    <option>Acumulación de Basura</option>
                    <option>Semáforo Averiado</option>
                    <option>Alumbrado Público</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dirección / Referencia</label>
                  <input className="form-control" value={form.ubicacion} onChange={e => setForm({...form, ubicacion: e.target.value})} placeholder="Ej: Av. Estrella cdra 4" />
                </div>

                <div className="form-group">
                  <label className="form-label">Estado de Atención</label>
                  <select className="form-control" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                    <option>Pendiente</option>
                    <option>En Proceso</option>
                    <option>Resuelto</option>
                  </select>
                </div>

                <button className={`btn btn-block ${form.id ? 'btn-warning' : 'btn-primary'}`} onClick={guardar}>
                  {form.id ? '💾 Guardar Cambios' : '🚀 Enviar Reporte'}
                </button>
                
                {form.id && (
                  <button className="btn btn-outline btn-block" onClick={() => setForm({ id: null, tipo: 'Bache en vía', ubicacion: '', estado: 'Pendiente' })}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {/* Panel de Datos */}
            <div>
              <div className="search-bar">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="🔍 Buscar por ubicación o tipo de incidencia..." 
                  value={filtroBusqueda}
                  onChange={e => setFiltroBusqueda(e.target.value)}
                />
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tipo de Incidencia</th>
                      <th>Ubicación</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidenciasFiltradas.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No se encontraron registros activos.</td></tr>
                    ) : (
                      incidenciasFiltradas.map(inc => (
                        <tr key={inc.id}>
                          <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{inc.tipo}</td>
                          <td>{inc.ubicacion}</td>
                          <td><span className={getBadgeClass(inc.estado)}>{inc.estado}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', marginRight: '8px' }} onClick={() => {setForm(inc); setVista('gestion');}}>
                              ✏️ Editar
                            </button>
                            <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => eliminar(inc.id)}>
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {vista === 'estadisticas' && (
          <div>
            <h3 style={{ marginBottom: '25px', color: 'var(--text-main)' }}>Métricas de Impacto Urbano</h3>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Reportes</h4>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', margin: '10px 0' }}>{incidencias.length}</p>
              </div>
              <div className="stat-card">
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Atendidos</h4>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)', margin: '10px 0' }}>{resueltos}</p>
              </div>
              <div className="stat-card">
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Pendientes</h4>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)', margin: '10px 0' }}>{pendientes}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};