import { ref, onMounted } from 'vue';

export const VueEstadisticas = {
  template: `
    <div style="background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); margin-top: 20px;">
      <h3 style="color: var(--primary); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.5rem;">📊</span> Panel Analítico (Renderizado por Vue.js)
      </h3>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid var(--border-color);">
          <h4 style="color: var(--text-muted); text-transform: uppercase; font-size: 0.85rem;">Total de Reportes</h4>
          <p style="font-size: 3rem; font-weight: bold; color: var(--primary); margin: 10px 0;">{{ total }}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid var(--border-color);">
          <h4 style="color: var(--text-muted); text-transform: uppercase; font-size: 0.85rem;">Problemas Resueltos</h4>
          <p style="font-size: 3rem; font-weight: bold; color: var(--success); margin: 10px 0;">{{ resueltos }}</p>
        </div>
      </div>
    </div>
  `,
  setup() {
    // Variables reactivas de Vue (equivalente a useState)
    const total = ref(0);
    const resueltos = ref(0);

    // Función para comunicarse con tu backend en Node
    const cargarMeticas = async () => {
      try {
        const res = await fetch('/api/incidencias');
        const data = await res.json();
        
        total.value = data.length;
        resueltos.value = data.filter((inc: any) => inc.estado === 'Resuelto').length;
      } catch (error) {
        console.error("Error al cargar datos en Vue:", error);
      }
    };

    // Equivalente a useEffect (se ejecuta al cargar)
    onMounted(() => {
      cargarMeticas();
    });

    return { total, resueltos };
  }
};