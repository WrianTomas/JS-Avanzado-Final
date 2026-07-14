import React from 'react';

// 1. ESTA FUNCIÓN SE EJECUTA 100% EN EL SERVIDOR DE NODE (SSR)
export async function getServerSideProps() {
  try {
    const res = await fetch('http://localhost:3000/api/incidencias');
    const incidencias = await res.json();
    return {
      props: { incidencias }, // Pasamos los datos al componente
    };
  } catch (error) {
    console.error("Error conectando al backend:", error);
    return {
      props: { incidencias: [] },
    };
  }
}

// 2. ESTE ES EL COMPONENTE VISUAL (Se envía al cliente ya con datos)
export default function PortalPublico({ incidencias }: { incidencias: any[] }) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#1e293b', fontSize: '2.5rem', marginBottom: '10px' }}>🏙️ GeoReporte Público</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            Portal de Transparencia Ciudadana. Explora las incidencias reportadas en el distrito.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {incidencias.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', background: 'white', padding: '30px', borderRadius: '12px' }}>
              No hay incidencias reportadas al momento. ¡Buen trabajo!
            </p>
          ) : (
            incidencias.map((inc) => (
              <div key={inc.id} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem' }}>{inc.tipo}</h2>
                  <span style={{ 
                    background: inc.estado === 'Resuelto' ? '#d1fae5' : inc.estado === 'Pendiente' ? '#fee2e2' : '#fef3c7',
                    color: inc.estado === 'Resuelto' ? '#065f46' : inc.estado === 'Pendiente' ? '#991b1b' : '#92400e',
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' 
                  }}>
                    {inc.estado}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📍 {inc.ubicacion}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}