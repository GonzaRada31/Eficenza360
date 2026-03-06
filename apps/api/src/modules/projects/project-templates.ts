import { ServiceType } from '@prisma/client';

export interface SubtaskTemplate {
  title: string;
  description: string;
  type?: 'GENERAL' | 'CONSUMPTION' | 'EQUIPMENT' | 'IMPROVEMENT';
  expectedInputType?:
    | 'TEXT'
    | 'NUMBER'
    | 'DATE'
    | 'FILE_UPLOAD'
    | 'SELECT'
    | 'TABLE'
    | 'CHECKLIST';
  subtasks?: SubtaskTemplate[]; // Recursive nesting
  // Efficiency & Context
  outputContext?: string[];
  inputContext?: string[];
  standard?: string;
  isActive?: boolean;
  deduplicationKey?: string;
  data?: Record<string, any>; // Initial data to populate the subtask
  workspaceMode?: 'INVOICE' | 'CHECKLIST' | 'STANDARD';
}

export interface TaskTemplate {
  title: string;
  description: string;
  subtasks?: SubtaskTemplate[];
  deduplicationKey?: string;
}

export interface ProjectTemplate {
  name: string;
  description: string;
  tasks: TaskTemplate[];
}

export const PROJECT_TEMPLATES: Record<string, ProjectTemplate> = {
  'Auditoria Energetica': {
    name: 'Auditoría Energética',
    description: 'Evaluación bajo estándar ISO 50002:2014',
    tasks: [
      {
        title: 'Planificación de la Auditoría',
        description: 'Fase inicial de planificación y acuerdos.',
        deduplicationKey: 'ENERGY_AUDIT_PLANNING',
        subtasks: [
          {
            title: 'Alcance y Objetivos',
            description: 'Acordar límites físicos y organizacionales.',
            deduplicationKey: 'PLAN_SCOPE',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Cronograma',
            description: 'Fechas de visitas y entregables.',
            deduplicationKey: 'PLAN_SCHEDULE',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Marco Normativo Aplicable',
            description: 'Identificación de regulaciones y estándares.',
            deduplicationKey: 'PLAN_REGULATORY',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Equipo de Trabajo y Roles',
            description: 'Asignación de responsables y auditores.',
            deduplicationKey: 'PLAN_TEAM',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Documentación Inicial del Cliente',
            description: 'Recopilación de documentos base.',
            deduplicationKey: 'PLAN_INITIAL_DOCS',
            workspaceMode: 'STANDARD',
          },
        ],
      },
      {
        title: 'Recopilación de Datos',
        description: 'Levantamiento de información energética.',
        deduplicationKey: 'ENERGY_DATA_COLLECTION',
        subtasks: [
          {
            title: 'Datos Históricos de Energía',
            description: 'Facturas y consumos históricos.',
            type: 'CONSUMPTION',
            deduplicationKey: 'DATA_COLLECTION_HISTORY',
            subtasks: [
              {
                title: 'Electricidad (Facturas)',
                description: 'Recopilar últimos 24 meses',
                type: 'CONSUMPTION',
                expectedInputType: 'FILE_UPLOAD',
                outputContext: ['ELECTRICITY_BILLS'],
                standard: 'ISO 50002',
                // PRESERVING EXISTING KEY
                deduplicationKey: 'DATA_ELECTRICITY_BILLS',
                workspaceMode: 'INVOICE',
                data: {
                  allowedServiceTypes: [ServiceType.ELECTRICITY],
                },
              },
              {
                title: 'Gas Natural (Facturas)',
                description: 'Recopilar facturación de gas de red',
                type: 'CONSUMPTION',
                expectedInputType: 'FILE_UPLOAD',
                outputContext: ['GAS_BILLS'],
                standard: 'ISO 50002',
                // PRESERVING EXISTING KEY
                deduplicationKey: 'DATA_GAS_BILLS',
                workspaceMode: 'INVOICE',
                data: {
                  allowedServiceTypes: [ServiceType.GAS_NATURAL],
                },
              },
              {
                title: 'Combustibles Líquidos',
                description: 'Nafta, Diesel (Gestión Unificada)',
                type: 'CONSUMPTION',
                expectedInputType: 'FILE_UPLOAD', // It's actually CUSTOM now but field is descriptive
                outputContext: ['FUEL_BILLS'],
                standard: 'ISO 50002',
                deduplicationKey: 'DATA_FUEL_LIQUID',
                workspaceMode: 'STANDARD',
                data: {},
              },
              {
                title: 'Otros Energéticos',
                description: 'Biomasa, Vapor, GLP, etc.',
                type: 'CONSUMPTION',
                expectedInputType: 'FILE_UPLOAD',
                outputContext: ['OTHER_ENERGY_BILLS'],
                standard: 'ISO 50002',
                deduplicationKey: 'DATA_OTHER_ENERGY',
                workspaceMode: 'STANDARD',
                data: {},
              },
            ],
          },
          {
            title: 'Inventario de Equipos',
            description: 'Relevamiento de USENs.',
            type: 'EQUIPMENT',
            deduplicationKey: 'DATA_EQUIPMENT_INVENTORY',
            workspaceMode: 'STANDARD',
            subtasks: [],
          },
          {
            title: 'Mediciones en Sitio',
            description: 'Registro de relevamientos manuales.',
            type: 'GENERAL',
            deduplicationKey: 'DATA_SITE_MEASUREMENTS',
            workspaceMode: 'STANDARD',
            subtasks: [],
          },
          {
            title: 'Información Operativa',
            description: 'Variables y drivers de consumo (KPIs).',
            type: 'GENERAL',
            deduplicationKey: 'DATA_OPERATIONAL_INFO',
            workspaceMode: 'STANDARD',
            subtasks: [],
          },
        ],
      },
      {
        title: 'Análisis Energético',
        description: 'Evaluación del desempeño energético.',
        deduplicationKey: 'ENERGY_ANALYSIS',
        subtasks: [
          {
            title: 'Análisis de Consumos',
            description: 'Evaluación detallada de matriz energética.',
            deduplicationKey: 'ENERGY_ANALYSIS_CONSUMPTION',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Identificación de Usos Significativos de Energía (USE)',
            description: 'Determinación de los mayores consumidores (Pareto).',
            deduplicationKey: 'ENERGY_ANALYSIS_USE',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Análisis de Patrones y Tendencias',
            description: 'Correlación con variables de producción/clima.',
            deduplicationKey: 'ENERGY_ANALYSIS_PATTERNS',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Benchmarking Interno / Externo',
            description: 'Comparativa de desempeño.',
            deduplicationKey: 'ENERGY_ANALYSIS_BENCHMARKING',
            workspaceMode: 'STANDARD',
          },
        ],
      },
      {
        title: 'Línea Base Energética',
        description: 'Determinación de la LBE.',
        deduplicationKey: 'ENERGY_BASELINE',
        subtasks: [
          {
            title: 'Definición del Año Base',
            description: 'Selección de período representativo.',
            deduplicationKey: 'BASELINE_YEAR_DEFINITION',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Variables Relevantes',
            description: 'Identificación de drivers (CDD, HDD, Producción).',
            deduplicationKey: 'BASELINE_VARIABLES',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Cálculo de Línea Base',
            description: 'Regresión lineal y modelado.',
            deduplicationKey: 'BASELINE_CALCULATION',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Ajustes y Normalizaciones',
            description: 'Correcciones por factores estáticos.',
            deduplicationKey: 'BASELINE_ADJUSTMENTS',
            workspaceMode: 'STANDARD',
          },
        ],
      },
      {
        title: 'Oportunidades de Mejora',
        description: 'Listado de mejoras detectadas.',
        deduplicationKey: 'ENERGY_IMPROVEMENTS',
        subtasks: [
          {
            title: 'Identificación de Oportunidades',
            description: 'Brainstorming y lista preliminar.',
            deduplicationKey: 'OPPORTUNITIES_IDENTIFICATION',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Evaluación Técnica',
            description: 'Viabilidad e ingeniería básica.',
            deduplicationKey: 'OPPORTUNITIES_TECH_EVAL',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Evaluación Económica',
            description: 'CAPEX, OPEX, Payback, TIR, VAN.',
            deduplicationKey: 'OPPORTUNITIES_ECON_EVAL',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Priorización',
            description: 'Matriz de impacto vs esfuerzo.',
            deduplicationKey: 'OPPORTUNITIES_PRIORITIZATION',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Plan de Implementación',
            description: 'Roadmap de ejecución.',
            deduplicationKey: 'OPPORTUNITIES_IMPLEMENTATION_PLAN',
            workspaceMode: 'STANDARD',
          },
        ],
      },
      {
        title: 'Informe Técnico',
        description: 'Entrega final.',
        deduplicationKey: 'ENERGY_REPORT',
        subtasks: [
          {
            title: 'Resumen Ejecutivo',
            description: 'Síntesis para la alta dirección.',
            deduplicationKey: 'REPORT_EXECUTIVE_SUMMARY',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Desarrollo Técnico',
            description: 'Cuerpo principal del informe.',
            deduplicationKey: 'REPORT_TECHNICAL_DEV',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Resultados y KPIs',
            description: 'Indicadores de desempeño y ahorros.',
            deduplicationKey: 'REPORT_RESULTS_KPIS',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Plan de Acción',
            description: 'Lista consolidada de medidas.',
            deduplicationKey: 'REPORT_ACTION_PLAN',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Anexos Técnicos',
            description: 'Planos, datasheets y mediciones.',
            deduplicationKey: 'REPORT_TECHNICAL_ANNEXES',
            workspaceMode: 'STANDARD',
          },
        ],
      },
    ],
  },
  'Huella de Carbono': {
    name: 'Huella de Carbono',
    description: 'Cálculo de emisiones Scope 1, 2 y 3',
    tasks: [
      {
        title: 'Definición Organizacional',
        description: 'Límites organizacionales y operativos.',
        deduplicationKey: 'CARBON_ORG_DEF',
        subtasks: [
          {
            title: 'Límites Organizacionales',
            description: 'Definición de enfoque de control.',
            deduplicationKey: 'CARBON_ORG_LIMITS',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Alcance Operacional',
            description: 'Identificación de emisiones asociadas.',
            deduplicationKey: 'CARBON_BS_SCOPE',
            workspaceMode: 'STANDARD',
          },
        ],
      },
      {
        title: 'Identificación de Fuentes de Emisión',
        description: 'Mapeo de fuentes por alcance.',
        deduplicationKey: 'CARBON_SOURCE_ID',
        subtasks: [
          {
            title: 'Alcance 1',
            description: 'Emisiones directas.',
            deduplicationKey: 'CARBON_SOURCE_SCOPE_1',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Alcance 2',
            description: 'Emisiones indirectas por energía.',
            deduplicationKey: 'CARBON_SOURCE_SCOPE_2',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Alcance 3',
            description: 'Otras emisiones indirectas.',
            deduplicationKey: 'CARBON_SOURCE_SCOPE_3',
            workspaceMode: 'STANDARD',
          },
        ],
      },
      {
        title: 'Recolección de Datos de Actividad',
        description: 'Recopilación de datos de consumo.',
        deduplicationKey: 'CARBON_DATA_COLLECTION',
        subtasks: [
          {
            title: 'Combustibles',
            description: 'Consumo de combustibles fósiles.',
            deduplicationKey: 'CARBON_DATA_FUELS',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Electricidad',
            description: 'Consumo de energía eléctrica.',
            deduplicationKey: 'CARBON_DATA_ELECTRICITY',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Transporte',
            description: 'Logística y traslados.',
            deduplicationKey: 'CARBON_DATA_TRANSPORT',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Residuos',
            description: 'Gestión de residuos.',
            deduplicationKey: 'CARBON_DATA_WASTE',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Otros',
            description: 'Otras fuentes de emisión.',
            deduplicationKey: 'CARBON_DATA_OTHER',
            workspaceMode: 'STANDARD',
          },
        ],
      },
      {
        title: 'Cálculo de Emisiones',
        description: 'Procesamiento y cálculo.',
        deduplicationKey: 'CARBON_CALCULATION',
        subtasks: [
          {
            title: 'Factores de Emisión',
            description: 'Selección de factores aplicables.',
            deduplicationKey: 'CARBON_CALC_FACTORS',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Cálculos por Alcance',
            description: 'Ejecución de fórmulas.',
            deduplicationKey: 'CARBON_CALC_SCOPE',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Consolidación Total',
            description: 'Sumatoria de emisiones (tCO2e).',
            deduplicationKey: 'CARBON_CALC_TOTAL',
            workspaceMode: 'STANDARD',
          },
        ],
      },
      {
        title: 'Identificación de Reducciones',
        description: 'Estrategias de mitigación.',
        deduplicationKey: 'CARBON_REDUCTIONS',
        subtasks: [
          {
            title: 'Medidas de Reducción',
            description: 'Propuestas de mejora.',
            deduplicationKey: 'CARBON_REDUCTIONS_MEASURES',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Impacto Estimado',
            description: 'Cálculo de abatimiento.',
            deduplicationKey: 'CARBON_REDUCTIONS_IMPACT',
            workspaceMode: 'STANDARD',
          },
        ],
      },
      {
        title: 'Estrategia de Compensación',
        description: 'Compensación de emisiones remanentes.',
        deduplicationKey: 'CARBON_OFFSETS',
        subtasks: [
          {
            title: 'Opciones de Compensación',
            description: 'Bonos de carbono y proyectos.',
            deduplicationKey: 'CARBON_OFFSETS_OPTIONS',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Evaluación de Proyectos',
            description: 'Análisis de viabilidad.',
            deduplicationKey: 'CARBON_OFFSETS_EVAL',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Plan de Neutralización',
            description: 'Hoja de ruta a la neutralidad.',
            deduplicationKey: 'CARBON_OFFSETS_PLAN',
            workspaceMode: 'STANDARD',
          },
        ],
      },
      {
        title: 'Informe de Huella',
        description: 'Reporte final.',
        deduplicationKey: 'CARBON_REPORT',
        subtasks: [
          {
            title: 'Resultados',
            description: 'Presentación de métricas.',
            deduplicationKey: 'CARBON_REPORT_RESULTS',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Comparativas',
            description: 'Benchmarking y evolución.',
            deduplicationKey: 'CARBON_REPORT_BENCHMARK',
            workspaceMode: 'STANDARD',
          },
          {
            title: 'Declaración Final',
            description: 'Documento para terceros.',
            deduplicationKey: 'CARBON_REPORT_DECLARATION',
            workspaceMode: 'STANDARD',
          },
        ],
      },
    ],
  },
};
