const form = document.getElementById('projectForm');
const output = document.getElementById('output');
const copyButton = document.getElementById('copyButton');
const downloadButton = document.getElementById('downloadButton');
const resetButton = document.getElementById('resetButton');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const totalSteps = 8;

const STUDY_RULES = {
  'Observacional transversal': {
    design: 'Estudio observacional de corte transversal, con finalidad descriptiva y/o analítica según la pregunta.',
    variables: [
      'Variable principal (resultado o condición de interés).',
      'Variables sociodemográficas relevantes (edad, sexo, nivel educativo u otras pertinentes).',
      'Variables clínicas o contextuales relacionadas con el problema.',
      'Posibles factores asociados o de confusión a considerar.'
    ],
    analysis: [
      'Análisis descriptivo de la muestra y de la variable principal.',
      'Comparación entre grupos si procede (según naturaleza de variables y distribución).',
      'Modelo de regresión lineal o logística según el tipo de variable principal.'
    ],
    alerts: [
      'Evitar inferencias causales: el diseño transversal no permite establecer causalidad temporal.',
      'Definir de forma explícita criterios de inclusión y exclusión.',
      'Justificar la fuente de datos y su calidad.'
    ]
  },
  Cohorte: {
    design: 'Estudio observacional longitudinal de cohortes para evaluar la asociación entre exposición y resultado en el tiempo.',
    variables: [
      'Exposición principal de interés.',
      'Resultado principal (evento, condición o cambio clínicamente relevante).',
      'Tiempo de seguimiento y puntos de medición.',
      'Factores de confusión y covariables relevantes.'
    ],
    analysis: [
      'Estimación de incidencia acumulada y/o densidad de incidencia.',
      'Cálculo de riesgo relativo y/o hazard ratio si procede.',
      'Análisis multivariante para ajuste de confusión.'
    ],
    alerts: [
      'Controlar y documentar pérdidas durante el seguimiento.',
      'Definir con precisión el periodo de observación.',
      'Implementar estrategias para minimizar sesgo de selección.'
    ]
  },
  'Casos y controles': {
    design: 'Estudio observacional analítico de casos y controles para explorar asociaciones entre exposiciones previas y evento de interés.',
    variables: [
      'Definición operativa y reproducible de caso.',
      'Definición de control y criterios de comparabilidad.',
      'Exposición previa principal y forma de medición.',
      'Factores de confusión potenciales.'
    ],
    analysis: [
      'Estimación de odds ratio cruda y ajustada.',
      'Análisis bivariante inicial.',
      'Análisis multivariante para control de confusión.'
    ],
    alerts: [
      'Valorar riesgo de sesgo de memoria y/o sesgo de registro.',
      'Asegurar comparabilidad estructural entre casos y controles.',
      'Justificar claramente el procedimiento de selección de controles.'
    ]
  },
  'Ensayo clínico': {
    design: 'Estudio experimental con asignación de intervención y comparador para evaluar eficacia, efectividad o seguridad.',
    variables: [
      'Intervención principal y protocolo de aplicación.',
      'Comparador (atención habitual, placebo u otra intervención).',
      'Resultado principal con definición clínica explícita.',
      'Eventos adversos y variables de seguridad.'
    ],
    analysis: [
      'Análisis por intención de tratar si procede según el diseño.',
      'Comparación entre grupos para resultado principal y secundarios.',
      'Análisis de seguridad y de sensibilidad cuando sea pertinente.'
    ],
    alerts: [
      'Requiere evaluación ética reforzada antes de su ejecución.',
      'Valorar registro del ensayo en plataforma reconocida.',
      'Describir procedimiento de consentimiento informado.',
      'Incluir cálculo formal del tamaño muestral.'
    ]
  },
  Cualitativo: {
    design: 'Estudio cualitativo exploratorio orientado a comprender significados, procesos y experiencias.',
    variables: [
      'Fenómeno de interés y unidad de análisis.',
      'Participantes y criterios de selección.',
      'Contexto de producción de la información.',
      'Dimensiones temáticas iniciales para guiar la recogida de datos.'
    ],
    analysis: [
      'Análisis temático o de contenido con codificación explícita.',
      'Triangulación de fuentes, analistas o técnicas si procede.',
      'Trazabilidad del proceso analítico y reflexividad del equipo investigador.'
    ],
    alerts: [
      'Justificar criterio de saturación teórica.',
      'Describir estrategia de muestreo cualitativo.',
      'Asegurar consentimiento, confidencialidad y tratamiento ético de narrativas.'
    ]
  },
  'Revisión sistemática': {
    design: 'Revisión sistemática de la literatura con pregunta estructurada y proceso reproducible.',
    variables: [
      'Pregunta estructurada (PICO o PEO, según corresponda).',
      'Bases de datos y fuentes de información a consultar.',
      'Criterios de inclusión y exclusión predefinidos.',
      'Estrategia de búsqueda reproducible y proceso de selección por pares.',
      'Evaluación de calidad metodológica/riesgo de sesgo de los estudios incluidos.'
    ],
    analysis: [
      'Síntesis narrativa estructurada.',
      'Metaanálisis si procede por homogeneidad clínica y metodológica.'
    ],
    alerts: [
      'Seguir guía PRISMA para reporte transparente.',
      'Valorar registro de protocolo antes de iniciar la revisión.',
      'Habitualmente no requiere CEI/CEIm, salvo uso de datos no públicos o información sensible.'
    ]
  },
  'Scoping review': {
    design: 'Revisión exploratoria (scoping review) para mapear alcance, conceptos y vacíos de evidencia.',
    variables: [
      'Pregunta amplia y delimitada según objetivo de mapeo.',
      'Criterios PCC: población, concepto y contexto.',
      'Estrategia de búsqueda y fuentes de información.',
      'Matriz de extracción y mapa de evidencia resultante.'
    ],
    analysis: [
      'Síntesis descriptiva de hallazgos.',
      'Categorización temática de conceptos, métodos y vacíos.'
    ],
    alerts: [
      'Seguir recomendaciones PRISMA-ScR para reporte.',
      'Evitar conclusiones de efectividad si la evidencia no lo permite.',
      'Aclarar que la evaluación formal de calidad no siempre es obligatoria en este diseño.'
    ]
  },
  Delphi: {
    design: 'Estudio de consenso mediante metodología Delphi con rondas sucesivas y retroalimentación controlada.',
    variables: [
      'Composición y criterios de selección del panel de expertos.',
      'Número de rondas y procedimiento de retroalimentación.',
      'Criterios operativos de consenso predefinidos.',
      'Mecanismos para preservar anonimato entre participantes.',
      'Indicadores de concordancia y estabilidad entre rondas.'
    ],
    analysis: [
      'Mediana y rango intercuartílico por ítem.',
      'Porcentaje de acuerdo para cada propuesta.',
      'Evaluación de estabilidad entre rondas si procede.'
    ],
    alerts: [
      'Justificar selección y diversidad de expertos.',
      'Definir previamente umbrales de consenso.',
      'Evitar sesgo de selección en la conformación del panel.'
    ]
  }
};

const PROJECT_TYPE_GUIDANCE = {
  TFG: [
    'Delimitar bien la pregunta de investigación para mantener foco y viabilidad.',
    'Ajustar el alcance a un trabajo realista para el tiempo y recursos disponibles.',
    'Priorizar una metodología sencilla, clara y ejecutable.',
    'Definir objetivos medibles y verificables en el cronograma académico.',
    'Construir un cronograma ajustado con hitos alcanzables.',
    'Evitar proyectos demasiado ambiciosos para el nivel y plazo del TFG.'
  ],
  TFM: [
    'Aportar una mayor profundidad metodológica y justificar cada decisión técnica.',
    'Desarrollar una justificación teórica y contextual más robusta.',
    'Planificar un análisis más sólido, coherente con objetivos y variables.',
    'Valorar una revisión bibliográfica estructurada o un estudio observacional bien delimitado.',
    'Comprobar coherencia explícita entre objetivos, variables y estrategia de análisis.'
  ],
  'Tesis doctoral': [
    'Sustentar el trabajo en una línea de investigación sólida y acumulativa.',
    'Jerarquizar objetivos principales y secundarios de forma explícita.',
    'Diseñar un plan de publicaciones alineado con los objetivos doctorales.',
    'Estructurar un cronograma plurianual con fases y entregables.',
    'Valorar un paquete de estudios coordinados si el problema lo requiere.',
    'Justificar factibilidad, originalidad e impacto potencial del programa de investigación.'
  ],
  'Protocolo CEI/CEIm': [
    'Redactar un resumen claro del estudio, su finalidad y su procedimiento.',
    'Incluir justificación científica explícita y actualizada.',
    'Argumentar de forma proporcionada el balance riesgo-beneficio.',
    'Incluir consentimiento informado o justificar técnicamente su exención.',
    'Detallar medidas de protección de datos.',
    'Definir anonimización o pseudonimización según proceda.',
    'Preparar hoja de información al participante cuando corresponda.',
    'Confirmar autorización del centro si la ejecución lo requiere.'
  ],
  'Artículo científico': [
    'Plantear una pregunta clara y metodológicamente respondible.',
    'Alinear diseño y reporte con guías EQUATOR aplicables.',
    'Organizar el manuscrito con estructura IMRaD.',
    'No inventar resultados ni anticipar hallazgos no observados.',
    'Explicitar limitaciones metodológicas y de validez externa.',
    'Mantener transparencia metodológica para permitir reproducibilidad.',
    'Seleccionar revista objetivo en fase posterior, tras consolidar el manuscrito.'
  ],
  Otro: [
    'Concretar la finalidad del proyecto y su utilidad esperada.',
    'Definir la audiencia destinataria principal.',
    'Delimitar alcance, entregables y productos esperados.',
    'Establecer criterios explícitos de evaluación del resultado final.'
  ]
};

const SAMPLE_SIZE_GUIDANCE = {
  'Observacional transversal': {
    intro: 'Orientación inicial: para justificar el tamaño muestral en un estudio observacional transversal suelen requerirse supuestos explícitos.',
    points: [
      'Variable principal.',
      'Prevalencia/proporción esperada o media esperada.',
      'Precisión deseada.',
      'Nivel de confianza.',
      'Población accesible.',
      'Pérdidas o datos incompletos esperados.'
    ]
  },
  Cohorte: {
    intro: 'Orientación inicial: en cohortes, la justificación muestral suele apoyarse en supuestos de evento, exposición y seguimiento.',
    points: [
      'Incidencia esperada del evento.',
      'Tamaño del efecto esperado.',
      'Proporción de expuestos/no expuestos.',
      'Tiempo de seguimiento.',
      'Pérdidas esperadas.',
      'Potencia y alfa.'
    ]
  },
  'Casos y controles': {
    intro: 'Orientación inicial: en casos y controles, la muestra suele justificarse con parámetros de exposición y efecto mínimo relevante.',
    points: [
      'Proporción de exposición en controles.',
      'Odds ratio mínima relevante.',
      'Ratio casos:controles.',
      'Potencia y alfa.',
      'Disponibilidad real de casos.'
    ]
  },
  'Ensayo clínico': {
    intro: 'Orientación inicial: el ensayo clínico requiere cálculo formal previo y validación metodológica/estadística específica.',
    points: [
      'Variable principal.',
      'Diferencia mínima clínicamente relevante.',
      'Desviación estándar o proporción esperada.',
      'Potencia.',
      'Alfa.',
      'Pérdidas esperadas.',
      'Asignación entre grupos.'
    ],
    alerts: [
      'Debe ser revisado por un metodólogo/estadístico y puede requerir registro del ensayo.'
    ]
  },
  Cualitativo: {
    intro: 'Orientación inicial: en estudios cualitativos no se aplica cálculo por potencia estadística clásica.',
    points: [
      'Saturación teórica o informativa.',
      'Diversidad de perfiles.',
      'Profundidad de entrevistas/grupos.',
      'Factibilidad y riqueza del discurso.'
    ]
  },
  'Revisión sistemática': {
    intro: 'Orientación inicial: en revisión sistemática no aplica tamaño muestral de participantes.',
    points: [
      'Alcance de la búsqueda.',
      'Bases de datos.',
      'Periodo temporal.',
      'Criterios de inclusión.',
      'Proceso de cribado.'
    ]
  },
  'Scoping review': {
    intro: 'Orientación inicial: en scoping review no aplica tamaño muestral clásico de participantes.',
    points: [
      'Amplitud de la pregunta.',
      'Criterios PCC.',
      'Fuentes de información.',
      'Estrategia de mapeo.'
    ]
  },
  Delphi: {
    intro: 'Orientación inicial: en Delphi, el tamaño del panel se justifica por representatividad experta y estabilidad del consenso.',
    points: [
      'Perfil experto.',
      'Heterogeneidad del panel.',
      'Número de áreas representadas.',
      'Número de rondas.',
      'Estabilidad del consenso.',
      'Pérdidas entre rondas.'
    ]
  },
  general: {
    intro: 'Orientación inicial general: antes de justificar tamaño muestral conviene definir con precisión el diseño del estudio.',
    points: [
      'Definir el diseño metodológico principal.',
      'Precisar variable principal y población accesible.',
      'Consultar validación metodológica/estadística antes del protocolo final.'
    ]
  }
};

function selectedRadio(name) {
  const input = form.querySelector(`input[name="${name}"]:checked`);
  return input ? input.value : '';
}

function suggestStudyType(idea, projectType) {
  const source = `${idea} ${projectType}`.toLowerCase();
  if (source.includes('efecto') || source.includes('impacto') || source.includes('intervención')) return 'Ensayo clínico';
  if (source.includes('experiencia') || source.includes('percepción') || source.includes('opinión')) return 'Cualitativo';
  if (source.includes('revisión') || source.includes('evidencia') || source.includes('síntesis')) return 'Revisión sistemática';
  if (source.includes('factor') || source.includes('riesgo') || source.includes('seguimiento')) return 'Cohorte';
  return 'Observacional transversal';
}

function normalizeStudyType(studyType, idea, projectType, methodAlerts) {
  if (!studyType || studyType === 'No lo sé') {
    const suggested = suggestStudyType(idea, projectType);
    methodAlerts.push(`No se definió un diseño explícito: se sugiere ${suggested} como punto de partida.`);
    return suggested;
  }

  if (!STUDY_RULES[studyType]) {
    methodAlerts.push('El tipo de estudio seleccionado no tiene reglas específicas; se aplica orientación general.');
    return 'Observacional transversal';
  }

  return studyType;
}

function buildMethodologicalAssessment(values, studyType, methodAlerts) {
  const required = {
    idea: Boolean(values.idea),
    population: Boolean(values.population),
    mainVariable: Boolean(values.mainVariable)
  };

  const missingCount = Object.values(required).filter((item) => !item).length;
  let color = '🟢 Verde';
  let judgment = 'Proyecto suficientemente definido para una primera revisión académica.';

  if (missingCount >= 2) {
    color = '🔴 Rojo';
    judgment = 'Proyecto insuficientemente definido; se recomienda completar elementos básicos antes de avanzar.';
  } else if (missingCount === 1) {
    color = '🟡 Amarillo';
    judgment = 'Proyecto prometedor, pero aún presenta elementos incompletos que limitan su solidez metodológica.';
  }

  const coherenceNotes = [];

  if (studyType === 'Revisión sistemática' || studyType === 'Scoping review') {
    if (!values.idea) coherenceNotes.push('La pregunta de revisión todavía no está delimitada temáticamente.');
    if (values.mainVariable && !values.mainVariable.toLowerCase().includes('pico') && !values.mainVariable.toLowerCase().includes('pcc')) {
      coherenceNotes.push('En revisiones es recomendable reformular la variable principal como estructura PICO/PEO o PCC.');
    }
  }

  if (studyType === 'Cualitativo' && values.mainVariable) {
    coherenceNotes.push('En estudios cualitativos conviene expresar la variable principal como fenómeno o dimensión de interés.');
  }

  if (coherenceNotes.length) {
    methodAlerts.push(...coherenceNotes);
  }

  const ethicsWarning = (values.personalData === 'Sí' || values.vulnerable === 'Sí')
    ? 'Advertencia ética: se identifican datos sensibles y/o participantes vulnerables. Deben reforzarse medidas de confidencialidad, consentimiento y evaluación ética proporcional.'
    : '';

  return { color, judgment, required, ethicsWarning };
}

function buildImprovementRecommendations(values, studyType, assessment) {
  const recommendations = [];

  if (!assessment.required.idea) {
    recommendations.push('Definir la idea inicial con mayor precisión (fenómeno, exposición o intervención concreta).');
  }
  if (!assessment.required.population) {
    recommendations.push('Especificar población diana, ámbito asistencial/comunitario y criterios básicos de elegibilidad.');
  }
  if (!assessment.required.mainVariable) {
    recommendations.push('Delimitar la variable o resultado principal con definición operativa y unidad de medida.');
  }

  if (studyType === 'Observacional transversal') {
    recommendations.push('Precisar si el enfoque transversal será descriptivo o analítico y evitar lenguaje causal en objetivos y conclusiones.');
  }
  if (studyType === 'Cohorte') {
    recommendations.push('Incluir un cronograma de seguimiento y estrategia para minimizar pérdidas y datos faltantes.');
  }
  if (studyType === 'Casos y controles') {
    recommendations.push('Definir la fuente de casos y controles en el mismo marco poblacional para mejorar comparabilidad.');
  }
  if (studyType === 'Ensayo clínico') {
    recommendations.push('Detallar asignación, cegamiento (si aplica), análisis por intención de tratar y plan de seguridad clínica.');
  }
  if (studyType === 'Cualitativo') {
    recommendations.push('Describir técnicas de generación de datos (entrevistas, grupos focales, observación) y criterios de saturación.');
  }
  if (studyType === 'Revisión sistemática') {
    recommendations.push('Estructurar la pregunta con PICO/PEO, registrar protocolo y preparar diagrama de flujo PRISMA.');
  }
  if (studyType === 'Scoping review') {
    recommendations.push('Definir criterios PCC y anticipar formato del mapa de evidencia para la síntesis final.');
  }
  if (studyType === 'Delphi') {
    recommendations.push('Establecer número estimado de rondas, umbral de consenso y plan de análisis de estabilidad entre rondas.');
  }

  if (values.personalData === 'No lo sé') {
    recommendations.push('Confirmar si habrá tratamiento de datos personales para planificar medidas de protección desde el inicio.');
  }

  if (!recommendations.length) {
    recommendations.push('Mantener coherencia entre pregunta, diseño, variables y plan de análisis antes del envío formal.');
  }

  return recommendations;
}

function buildProjectTypeGuidance(projectType) {
  const points = PROJECT_TYPE_GUIDANCE[projectType] || PROJECT_TYPE_GUIDANCE.Otro;
  return {
    projectType: projectType || 'Otro',
    points
  };
}

function buildSampleSizeGuidance(values, studyType) {
  const guidance = studyType === 'No lo sé'
    ? SAMPLE_SIZE_GUIDANCE.general
    : (SAMPLE_SIZE_GUIDANCE[studyType] || SAMPLE_SIZE_GUIDANCE.general);
  const alerts = [];

  if (!values.mainVariable) {
    alerts.push('No puede orientarse adecuadamente el tamaño muestral sin una variable principal clara.');
  }
  if (!values.population) {
    alerts.push('Debe concretarse la población accesible o marco muestral.');
  }
  if (values.studyType === 'No lo sé' || !values.studyType) {
    alerts.push('Se recomienda definir primero el diseño del estudio para orientar el tamaño muestral de forma pertinente.');
  }
  if (guidance.alerts) {
    alerts.push(...guidance.alerts);
  }

  return {
    intro: guidance.intro,
    points: guidance.points,
    alerts
  };
}

function buildMissingCriticalElements(values) {
  const missing = [];

  if (!values.idea) missing.push('Falta idea inicial.');
  if (!values.population) missing.push('Falta población.');
  if (!values.mainVariable) missing.push('Falta variable principal.');
  if (!values.studyType) missing.push('Falta diseño.');
  if (!values.personalData && !values.vulnerable) missing.push('Falta información ética.');
  if (!values.personalData) missing.push('Falta aclarar si hay datos personales.');
  if (!values.vulnerable) missing.push('Falta aclarar si hay participantes vulnerables.');

  if (!missing.length) {
    missing.push('Los elementos iniciales esenciales están definidos, aunque deben revisarse con el tutor o equipo metodológico.');
  }

  return missing;
}

function buildDraft(values) {
  const warnings = [];
  const ethicsAlerts = [];
  const methodAlerts = [];

  const studyType = normalizeStudyType(values.studyType, values.idea, values.projectType, methodAlerts);
  const rules = STUDY_RULES[studyType] || STUDY_RULES['Observacional transversal'];

  if (!values.mainVariable) warnings.push('No se ha definido la variable/resultado principal: el objetivo aún no es plenamente evaluable.');
  if (!values.population) warnings.push('No se ha definido población/muestra: la pregunta está insuficientemente delimitada.');
  if (!values.idea) warnings.push('No se ha definido idea inicial: se requiere concretar el problema de investigación.');

  if (values.personalData === 'Sí') {
    ethicsAlerts.push('Se prevé uso de datos personales/clínicos: planificar base jurídica, minimización de datos y medidas de anonimización o seudonimización.');
  } else if (values.personalData === 'No lo sé') {
    ethicsAlerts.push('Confirmar si existirán datos personales para definir garantías de protección de datos y documentación ética asociada.');
  }

  if (values.vulnerable === 'Sí') {
    ethicsAlerts.push('Se incluyen participantes vulnerables: aplicar salvaguardas reforzadas de consentimiento, información y seguimiento ético.');
  } else if (values.vulnerable === 'No lo sé') {
    ethicsAlerts.push('Aclarar si habrá población vulnerable para adaptar proporcionalmente la gestión de riesgos y consentimiento.');
  }

  const isReview = studyType === 'Revisión sistemática' || studyType === 'Scoping review';

  const title = values.idea
    ? `${values.idea.trim()} en ${values.population || 'población por definir'}`
    : `Propuesta preliminar de ${values.projectType || 'proyecto de investigación'}`;

  const question = isReview
    ? `¿Qué evidencia existe sobre ${values.idea || 'el fenómeno de interés'} en ${values.area || 'el área seleccionada'} y cómo se distribuye según los criterios definidos?`
    : `¿Cuál es la relación entre ${values.idea || 'el fenómeno/exposición de interés'} y ${values.mainVariable || 'el resultado principal'} en ${values.population || 'la población objetivo'}?`;

  const briefJustification = `La propuesta se orienta a ${values.area || 'un área de interés académico'} y pretende generar una base metodológica inicial, factible y revisable con supervisión docente, sin asumir resultados previos ni inferencias no sustentadas.`;

  const overallGoal = isReview
    ? `Sintetizar de forma estructurada la evidencia disponible sobre ${values.idea || 'el tema propuesto'} para identificar hallazgos consistentes y vacíos de conocimiento.`
    : `Desarrollar un protocolo preliminar para estudiar ${values.idea || 'el fenómeno de interés'} en ${values.population || 'la población objetivo'}, con un diseño ${studyType.toLowerCase()} metodológicamente coherente.`;

  const specificGoals = isReview
    ? [
        'Delimitar la pregunta de revisión y criterios de elegibilidad.',
        'Aplicar una búsqueda reproducible en bases de datos pertinentes.',
        'Sintetizar los hallazgos y describir limitaciones metodológicas de la evidencia incluida.'
      ]
    : [
        `Describir características de ${values.population || 'la población de estudio'}.`,
        `Definir y operacionalizar ${values.mainVariable || 'la variable principal'} para su medición.`,
        'Explorar asociaciones relevantes considerando posibles factores de confusión.'
      ];

  const populationSection = values.population
    ? `Población diana propuesta: ${values.population}. Se recomienda definir marco de muestreo, criterios de inclusión/exclusión y tamaño muestral preliminar.`
    : 'Población y muestra pendientes de definición. Debe concretarse población diana, ámbito de captación y estrategia de muestreo antes de presentar el protocolo.';

  const variablesSection = rules.variables;
  const analysisPlan = rules.analysis;
  methodAlerts.push(...rules.alerts);

  const assessment = buildMethodologicalAssessment(values, studyType, methodAlerts);
  if (assessment.ethicsWarning) ethicsAlerts.push(assessment.ethicsWarning);

  const recommendations = buildImprovementRecommendations(values, studyType, assessment);
  const projectTypeGuidance = buildProjectTypeGuidance(values.projectType);
  const sampleSizeGuidance = buildSampleSizeGuidance(values, values.studyType);
  const missingCriticalElements = buildMissingCriticalElements(values);

  const checklist = [
    'La pregunta de investigación está delimitada y es coherente con el diseño propuesto.',
    'La población objetivo y criterios de elegibilidad están explícitos.',
    'La variable principal se encuentra operacionalizada.',
    'Existe un plan de análisis preliminar alineado con los objetivos.',
    'Se han identificado sesgos previsibles y estrategias de control.',
    'Se han considerado implicaciones éticas y de protección de datos.',
    'El documento está listo para revisión por tutor o comité competente.'
  ];

  return {
    title,
    question,
    briefJustification,
    overallGoal,
    specificGoals,
    studyType,
    designDescription: rules.design,
    populationSection,
    variablesSection,
    analysisPlan,
    warnings,
    methodAlerts,
    ethicsAlerts,
    assessment,
    recommendations,
    checklist,
    projectTypeGuidance,
    sampleSizeGuidance,
    missingCriticalElements
  };
}

function formatDraft(data, values) {
  const lines = [
    '=== AYUDAINVESTIGACION · BORRADOR INICIAL ===',
    `Fecha: ${new Date().toLocaleString()}`,
    '',
    `Tipo de proyecto: ${values.projectType || 'No especificado'}`,
    `Área: ${values.area || 'No especificada'}`,
    '',
    '1. Título provisional',
    data.title,
    '',
    '2. Pregunta de investigación',
    data.question,
    '',
    '3. Justificación breve',
    data.briefJustification,
    '',
    '4. Objetivo general',
    data.overallGoal,
    '',
    '5. Objetivos específicos',
    ...data.specificGoals.map((goal, idx) => `${idx + 1}. ${goal}`),
    '',
    '6. Diseño metodológico sugerido',
    `Tipo de estudio: ${data.studyType}`,
    `Descripción: ${data.designDescription}`,
    ...(data.methodAlerts.length ? ['', 'Alertas metodológicas:', ...data.methodAlerts.map((alert, idx) => `${idx + 1}. ${alert}`)] : []),
    '',
    '7. Población y muestra',
    data.populationSection,
    '',
    '8. Variables principales y secundarias',
    ...data.variablesSection.map((item, idx) => `${idx + 1}. ${item}`),
    '',
    '9. Análisis estadístico o cualitativo preliminar',
    ...data.analysisPlan.map((item, idx) => `${idx + 1}. ${item}`),
    ...(data.warnings.length ? ['', 'Observaciones por campos incompletos:', ...data.warnings.map((warning, idx) => `${idx + 1}. ${warning}`)] : []),
    '',
    '10. Consideraciones éticas iniciales',
    ...(data.ethicsAlerts.length ? data.ethicsAlerts.map((alert, idx) => `${idx + 1}. ${alert}`) : ['No se detectan alertas adicionales más allá de la revisión ética ordinaria.']),
    '',
    '11. Valoración metodológica inicial',
    `Semáforo: ${data.assessment.color}`,
    data.assessment.judgment,
    '',
    '12. Orientación específica según tipo de proyecto',
    `Tipo de proyecto orientado: ${data.projectTypeGuidance.projectType}`,
    ...data.projectTypeGuidance.points.map((item, idx) => `${idx + 1}. ${item}`),
    '',
    '13. Orientación inicial sobre tamaño muestral',
    data.sampleSizeGuidance.intro,
    ...data.sampleSizeGuidance.points.map((item, idx) => `${idx + 1}. ${item}`),
    ...(data.sampleSizeGuidance.alerts.length
      ? ['', 'Alertas y prudencia metodológica:', ...data.sampleSizeGuidance.alerts.map((item, idx) => `${idx + 1}. ${item}`)]
      : []),
    '',
    '14. Elementos críticos que faltan',
    ...data.missingCriticalElements.map((item, idx) => `${idx + 1}. ${item}`),
    '',
    '15. Recomendaciones para mejorar antes de enviar al tutor o comité',
    ...data.recommendations.map((item, idx) => `${idx + 1}. ${item}`),
    '',
    '16. Checklist previo al envío',
    ...data.checklist.map((item, idx) => `[ ] ${idx + 1}. ${item}`),
    '',
    'Nota: Este borrador ofrece orientación inicial y requiere validación con tutor, metodólogo y/o estadístico según el caso. No sustituye la evaluación metodológica, estadística ni ética formal.'
  ];

  return lines.join('\n');
}

function collectValues() {
  return {
    projectType: document.getElementById('projectType').value,
    area: document.getElementById('area').value,
    idea: document.getElementById('idea').value.trim(),
    population: document.getElementById('population').value.trim(),
    mainVariable: document.getElementById('mainVariable').value.trim(),
    studyType: document.getElementById('studyType').value,
    personalData: selectedRadio('personalData'),
    vulnerable: selectedRadio('vulnerable')
  };
}

function updateProgress() {
  const values = collectValues();
  let completed = 0;

  if (values.projectType) completed += 1;
  if (values.area) completed += 1;
  if (values.idea) completed += 1;
  if (values.population) completed += 1;
  if (values.mainVariable) completed += 1;
  if (values.studyType) completed += 1;
  if (values.personalData) completed += 1;
  if (values.vulnerable) completed += 1;

  const percent = Math.max(12, Math.round((completed / totalSteps) * 100));
  progressBar.style.width = `${percent}%`;
  progressBar.parentElement.setAttribute('aria-valuenow', String(percent));
  progressText.textContent = `Paso ${Math.max(completed, 1)} de ${totalSteps}`;
  progressPercent.textContent = `${percent}%`;
}

form.addEventListener('input', updateProgress);
form.addEventListener('change', updateProgress);

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const values = collectValues();
  const draftData = buildDraft(values);
  const text = formatDraft(draftData, values);

  output.textContent = text;
});

copyButton.addEventListener('click', async () => {
  if (!output.textContent) return;
  try {
    await navigator.clipboard.writeText(output.textContent);
    copyButton.textContent = '¡Copiado!';
    setTimeout(() => {
      copyButton.textContent = 'Copiar resultado';
    }, 1400);
  } catch {
    copyButton.textContent = 'No se pudo copiar';
    setTimeout(() => {
      copyButton.textContent = 'Copiar resultado';
    }, 1400);
  }
});

downloadButton.addEventListener('click', () => {
  const blob = new Blob([output.textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'borrador_ayudainvestigacion.txt';
  link.click();
  URL.revokeObjectURL(url);
});

resetButton.addEventListener('click', () => {
  form.reset();
  output.textContent = 'Completa el formulario y pulsa “Generar borrador”.';
  updateProgress();
});

updateProgress();
