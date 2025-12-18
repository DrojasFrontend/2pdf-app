import { create } from 'zustand';

const defaultHtml = `<div class="card">
  <h1>Hello {{name}}</h1>
  <p>Email: {{user.email}}</p>
  <p>{{description}}</p>
  
  <h2>Resultados</h2>
  <ul>
    {% for resultado in resultados %}
    <li>{{resultado.titulo}} - {{resultado.valor}}</li>
    {% endfor %}
  </ul>
</div>`;

const defaultCss = `body {
  font-family: 'Inter', sans-serif;
  padding: 20px;
  background: #f5f5f5;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

h1 {
  color: #2563eb;
  margin-bottom: 12px;
}

p {
  color: #64748b;
  margin: 8px 0;
}`;

const getDefaultData = (userName = "Usuario", userEmail = "usuario@example.com") => {
  return JSON.stringify({
    name: userName,
    user: {
      email: userEmail
    },
    description: "Welcome to the template editor!",
    resultados: [
      { titulo: "Ventas Q1", valor: "$12,500" },
      { titulo: "Ventas Q2", valor: "$15,800" },
      { titulo: "Ventas Q3", valor: "$18,200" }
    ]
  }, null, 2);
};

const defaultData = getDefaultData();

export const useEditorStore = create((set) => ({
  html: defaultHtml,
  css: defaultCss,
  data: defaultData,
  
  // Estado guardado para comparar cambios
  savedHtml: defaultHtml,
  savedCss: defaultCss,
  savedData: defaultData,
  
  setHtml: (html) => set({ html }),
  setCss: (css) => set({ css }),
  setData: (data) => set({ data }),
  
  // Guardar el estado actual como "guardado"
  markAsSaved: () => set((state) => ({
    savedHtml: state.html,
    savedCss: state.css,
    savedData: state.data,
  })),
  
  updateUserData: (user) => {
    // Obtener el nombre del usuario desde user_metadata, priorizando display_name
    const displayName = user?.user_metadata?.display_name || 
                       user?.user_metadata?.full_name || 
                       user?.user_metadata?.name ||
                       user?.email?.split('@')[0] || 
                       "Usuario";
    const email = user?.email || "usuario@example.com";
    
    // Obtener los datos actuales
    set((state) => {
      try {
        const currentData = JSON.parse(state.data);
        // Actualizar solo name y user.email, mantener el resto
        const updatedData = {
          ...currentData,
          name: displayName,
          user: {
            ...currentData.user,
            email: email
          }
        };
        return {
          data: JSON.stringify(updatedData, null, 2)
        };
      } catch {
        // Si hay error parseando, crear datos nuevos
        return {
          data: getDefaultData(displayName, email)
        };
      }
    });
  },
  
  applyAIResponse: (response) => {
    const { html, css, data } = response;
    set({
      html: html || defaultHtml,
      css: css || defaultCss,
      data: data ? (typeof data === 'string' ? data : JSON.stringify(data, null, 2)) : defaultData,
    });
  },
}));

