import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { jsPDF } from 'jspdf'; // <-- IMPORTAMOS LA LIBRERÍA

// --- SSR: CARGA INICIAL DESDE EL SERVIDOR ---
export async function getServerSideProps() {
  try {
    const res = await fetch('https://js-avanzado-final.onrender.com/api/incidencias');
    const datos = await res.json();
    return { props: { datosIniciales: datos } };
  } catch (error) {
    console.error("Error SSR:", error);
    return { props: { datosIniciales: [] } };
  }
}

export default function PortalPublico({ datosIniciales }: { datosIniciales: any[] }) {
  const [incidencias, setIncidencias] = useState<any[]>(datosIniciales);
  const [pestañaActiva, setPestañaActiva] = useState<'consultar' | 'reportar'>('consultar');
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState<any | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  const [nuevoTipo, setNuevoTipo] = useState('');
  const [nuevaUbicacion, setNuevaUbicacion] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);

  const incidenciasProcesadas = useMemo(() => {
    let resultado = [...incidencias];
    if (busqueda.trim() !== '') {
      const q = busqueda.toLowerCase();
      resultado = resultado.filter(inc =>
        inc.id.toString().includes(q) ||
        inc.tipo.toLowerCase().includes(q) ||
        inc.ubicacion.toLowerCase().includes(q)
      );
    }
    if (filtroEstado !== 'Todos') {
      resultado = resultado.filter(inc => inc.estado === filtroEstado);
    }
    return resultado.sort((a, b) => b.id - a.id);
  }, [incidencias, busqueda, filtroEstado]);

  const formatearFecha = (inc: any) => {
    if (inc.fechaCreacion) {
      return new Date(inc.fechaCreacion).toLocaleString('es-PE', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
    return 'Registro Inicial';
  };

  // --- NUEVA FUNCIÓN: GENERADOR DE PDF PROFESIONAL ---
  const generarPDF = (inc: any) => {
    const doc = new jsPDF();

    // Estilos de Cabecera
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("GeoReporte Urbano", 20, 20);

    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text("Comprobante Oficial de Incidencia", 20, 30);

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);
    doc.line(20, 35, 190, 35);

    // Detalles del Reporte
    let y = 50;
    const salto = 12;
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);

    const agregarFila = (etiqueta: string, valor: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(etiqueta, 20, y);
      doc.setFont("helvetica", "normal");

      // Controlar textos largos (como la descripción)
      const textoDividido = doc.splitTextToSize(valor || 'No especificado', 130);
      doc.text(textoDividido, 65, y);
      y += (textoDividido.length * 6) + 6; // Ajusta el salto según las líneas
    };

    agregarFila("Nro. Ticket:", `#${inc.id}`);
    agregarFila("Estado:", `${inc.estado.toUpperCase()}`);
    agregarFila("Categoría:", `${inc.tipo}`);
    agregarFila("Ubicación:", `${inc.ubicacion}`);
    agregarFila("Fecha Registro:", `${formatearFecha(inc)}`);
    agregarFila("Descripción:", `${inc.descripcion || 'Sin detalles adicionales registrados.'}`);

    // Pie de página
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("Documento generado automáticamente por el Portal Ciudadano.", 20, 280);

    // Guardar el archivo en la PC del usuario
    doc.save(`GeoReporte_Ticket_${inc.id}.pdf`);
  };

  const enviarReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {

      const res = await fetch('https://js-avanzado-final.onrender.com/api/incidencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: nuevoTipo,
          ubicacion: nuevaUbicacion,
          descripcion: nuevaDescripcion,
          estado: 'Pendiente'
        })
      });
      const nuevaIncidencia = await res.json();

      setIncidencias([nuevaIncidencia, ...incidencias]);
      setNuevoTipo(''); setNuevaUbicacion(''); setNuevaDescripcion('');
      alert("¡Reporte enviado con éxito! Las autoridades han sido notificadas.");
      setPestañaActiva('consultar');
    } catch (error) {
      alert("Error al enviar el reporte. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Head><title>Portal de Transparencia | GeoReporte</title></Head>

      <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#334155' }}>

        <header style={{ backgroundColor: '#0f172a', padding: '50px 20px', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', fontWeight: '800' }}>🏙️ Portal Ciudadano Activo</h1>
            <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
              Transparencia y colaboración. Consulta incidencias o reporta nuevos problemas en tu distrito.
            </p>
          </div>
        </header>

        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px', marginTop: '-55px' }}>
            <button
              onClick={() => setPestañaActiva('consultar')}
              style={{ padding: '15px 30px', fontSize: '1rem', fontWeight: 'bold', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s', border: 'none', backgroundColor: pestañaActiva === 'consultar' ? '#3b82f6' : 'white', color: pestañaActiva === 'consultar' ? 'white' : '#64748b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            >
              🔍 Consultar Casos
            </button>
            <button
              onClick={() => setPestañaActiva('reportar')}
              style={{ padding: '15px 30px', fontSize: '1rem', fontWeight: 'bold', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s', border: 'none', backgroundColor: pestañaActiva === 'reportar' ? '#10b981' : 'white', color: pestañaActiva === 'reportar' ? 'white' : '#64748b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            >
              🚨 Reportar Problema
            </button>
          </div>

          {pestañaActiva === 'consultar' && (
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

              <aside style={{ flex: '1 1 300px', backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 20px 0' }}>Filtros de Búsqueda</h3>
                <input
                  type="text" placeholder="Buscar por ID, Tipo o Lugar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', outline: 'none' }}
                />
                <select
                  value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: 'white' }}
                >
                  <option value="Todos">Todos los Estados</option>
                  <option value="Resuelto">✅ Resueltos</option>
                  <option value="Pendiente">⏳ Pendientes</option>
                </select>
              </aside>

              <section style={{ flex: '2 1 600px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {incidenciasProcesadas.map((inc) => (
                  <article
                    key={inc.id}
                    onClick={() => setIncidenciaSeleccionada(inc)}
                    style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderTop: `4px solid ${inc.estado === 'Resuelto' ? '#10b981' : inc.estado === 'Pendiente' ? '#ef4444' : '#f59e0b'}` }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>#{inc.id}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: inc.estado === 'Resuelto' ? '#059669' : '#b91c1c' }}>{inc.estado}</span>
                    </div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#0f172a' }}>{inc.tipo}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>📍 {inc.ubicacion}</p>
                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#3b82f6', fontWeight: 'bold', textAlign: 'center' }}>
                      Ver detalles completos ➔
                    </div>
                  </article>
                ))}
              </section>
            </div>
          )}

          {pestañaActiva === 'reportar' && (
            <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', color: '#0f172a' }}>Enviar Nuevo Reporte</h2>
              <p style={{ color: '#64748b', marginBottom: '30px' }}>Ayúdanos a mejorar el distrito. Proporciona los detalles exactos del problema.</p>

              <form onSubmit={enviarReporte} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>Tipo de Incidencia *</label>
                  <select required value={nuevoTipo} onChange={e => setNuevoTipo(e.target.value)} style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="">Selecciona una categoría...</option>
                    <option value="Bache en vía">Bache o daño en la vía</option>
                    <option value="Acumulación de Basura">Acumulación de Basura</option>
                    <option value="Semáforo Averiado">Semáforo Averiado</option>
                    <option value="Alumbrado Público">Falla de Alumbrado Público</option>
                    <option value="Otro">Otro tipo de accidente</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>Ubicación Exacta *</label>
                  <input required type="text" placeholder="Ej: Av. Principal cruce con Calle 2" value={nuevaUbicacion} onChange={e => setNuevaUbicacion(e.target.value)} style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>Descripción Adicional (Opcional)</label>
                  <textarea rows={4} placeholder="Brinda más detalles para ayudar al equipo técnico..." value={nuevaDescripcion} onChange={e => setNuevaDescripcion(e.target.value)} style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
                </div>

                <button type="submit" disabled={enviando} style={{ padding: '16px', backgroundColor: enviando ? '#94a3b8' : '#10b981', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', borderRadius: '8px', cursor: enviando ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'background-color 0.3s' }}>
                  {enviando ? 'Enviando reporte...' : '🚀 Enviar Reporte Oficial'}
                </button>
              </form>
            </div>
          )}

        </main>

        {incidenciaSeleccionada && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

              <div style={{ backgroundColor: incidenciaSeleccionada.estado === 'Resuelto' ? '#10b981' : incidenciaSeleccionada.estado === 'Pendiente' ? '#ef4444' : '#f59e0b', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Detalle de Incidencia</h3>
                <button onClick={() => setIncidenciaSeleccionada(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              <div style={{ padding: '30px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Identificador (Ticket)</p>
                  <p style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 'bold' }}>#{incidenciaSeleccionada.id}</p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Clasificación</p>
                  <p style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{incidenciaSeleccionada.tipo}</p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Lugar Exacto</p>
                  <p style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>📍 {incidenciaSeleccionada.ubicacion}</p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Fecha de Registro</p>
                  <p style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>📅 {formatearFecha(incidenciaSeleccionada)}</p>
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Estado Actual</p>
                  <span style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#f1f5f9', borderRadius: '8px', fontWeight: 'bold', color: '#334155' }}>
                    {incidenciaSeleccionada.estado}
                  </span>
                </div>

                {/* BOTÓN PARA GENERAR PDF */}
                <button
                  onClick={() => generarPDF(incidenciaSeleccionada)}
                  style={{ width: '100%', padding: '14px', backgroundColor: '#0f172a', color: 'white', fontWeight: 'bold', fontSize: '1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.3s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                >
                  📄 Descargar Ticket Oficial en PDF
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}