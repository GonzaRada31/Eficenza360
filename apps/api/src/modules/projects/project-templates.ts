
export const PROJECT_TEMPLATES = {
  'Auditoria Energetica': {
    name: 'Auditoría Energética',
    description: 'Evaluación ISO 50001 y eficiencia energética',
    tasks: [
      {
        title: 'Relevamiento General',
        description: 'Recopilación de información base del edificio o planta.',
        subtasks: [
          { title: 'Tipo de Edificio / Proceso', description: 'Definir tipología constructiva y uso principal.', type: 'GENERAL' },
          { title: 'Superficie / Producción', description: 'Metros cuadrados cubiertos o volumen de producción.', type: 'GENERAL' },
          { title: 'Horarios de Uso', description: 'Esquema de horarios operativos.', type: 'GENERAL' },
          { title: 'Usuarios / Turnos', description: 'Cantidad de ocupantes y rotación de turnos.', type: 'GENERAL' },
        ]
      },
      {
        title: 'Consumos Energéticos',
        description: 'Análisis de fuentes de energía y facturación.',
        subtasks: [
          { title: 'Electricidad', description: 'Análisis de facturas eléctricas.', type: 'CONSUMPTION' },
          { title: 'Gas Natural', description: 'Análisis de consumo de gas.', type: 'CONSUMPTION' },
          { title: 'Combustibles Líquidos', description: 'Diesel, Fuel Oil, etc.', type: 'CONSUMPTION' },
          { title: 'Otros Energéticos', description: 'Biomasa, GLP, etc.', type: 'CONSUMPTION' },
        ]
      },
      {
        title: 'Sistemas y Equipos',
        description: 'Inventario y diagnóstico de equipos principales.',
        subtasks: [
          { title: 'Envolvente Térmica', description: 'Aislación, ventanas, techos.', type: 'EQUIPMENT' },
          { title: 'Iluminación', description: 'Tecnología, control y niveles lumínicos.', type: 'EQUIPMENT' },
          { title: 'Climatización', description: 'Equipos de HVAC, calderas, chillers.', type: 'EQUIPMENT' },
          { title: 'Equipamiento Productivo', description: 'Maquinaria de proceso principal.', type: 'EQUIPMENT' },
          { title: 'Motores', description: 'Bombas, compresores, ventiladores.', type: 'EQUIPMENT' },
          { title: 'Transporte Interno', description: 'Autoelevadores, cintas, flotas.', type: 'EQUIPMENT' },
        ]
      },
      {
        title: 'Medidas de Mejora',
        description: 'Propuestas de eficiencia energética.',
        subtasks: [
          { title: 'Medidas Pasivas', description: 'Mejoras en aislación y diseño.', type: 'IMPROVEMENT' },
          { title: 'Medidas Activas', description: 'Recambio tecnológico (LED, Motores IE3).', type: 'IMPROVEMENT' },
          { title: 'Gestión y Operación', description: 'Cambios en procedimientos y setpoints.', type: 'IMPROVEMENT' },
          { title: 'Energías Renovables', description: 'Solar FV, Térmica, Biomasa.', type: 'IMPROVEMENT' },
        ]
      }
    ]
  },
  'Huella de Carbono': {
      name: 'Huella de Carbono',
      description: 'Cálculo de emisiones Scope 1, 2 y 3',
      tasks: [
          {
              title: 'Definición de Alcance',
              description: 'Límites organizacionales y operativos.',
              subtasks: []
          },
          {
              title: 'Recopilación de Datos (Scope 1)',
              description: 'Emisiones directas.',
              subtasks: []
          },
          {
               title: 'Recopilación de Datos (Scope 2)',
               description: 'Emisiones indirectas por energía.',
               subtasks: []
          }
      ]
  }
};
