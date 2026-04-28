const form = document.getElementById('projectForm');
const output = document.getElementById('output');
const copyButton = document.getElementById('copyButton');
const downloadButton = document.getElementById('downloadButton');
const resetButton = document.getElementById('resetButton');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const totalSteps = 8;

function selectedRadio(name) {
  const input = form.querySelector(`input[name="${name}"]:checked`);
  return input ? input.value : '';
}

function suggestStudyType(idea, projectType) {
  const source = `${idea} ${projectType}`.toLowerCase();
  if (source.includes('efecto') || source.includes('impacto') || source.includes('intervención')) {
    return 'Ensayo clínico';
  }
  if (source.includes('experiencia') || source.includes('percepción') || source.includes('opinión')) {
    return 'Cualitativo';
  }
  if (source.includes('revisión') || source.includes('evidencia') || source.includes('síntesis')) {
    return 'Revisión sistemática';
  }
  if (source.includes('factor') || source.includes('riesgo')) {
    return 'Cohorte';
  }
  return 'Observacional transversal';
}

function buildDraft(values) {
  const warnings = [];
  const ethicsAlerts = [];
  const methodAlerts = [];

  let studyType = values.studyType || 'No definido';

  if (values.studyType === 'No lo sé' || !values.studyType) {
    studyType = suggestStudyType(values.idea, values.projectType);
    methodAlerts.push(`No se definió un diseño: se sugiere ${studyType} como punto de partida.`);
  }

  if (!values.mainVariable) {
    warnings.push('No has definido variable/resultado principal: el objetivo aún no es evaluable.');
  }

  if (!values.population) {
    warnings.push('No has definido población/muestra: la pregunta está poco delimitada.');
  }

  if (values.personalData === 'Sí') {
    ethicsAlerts.push('Hay uso de datos personales/clínicos: planifica anonimización o pseudonimización, consentimiento o justificación de dispensa.');
  } else if (values.personalData === 'No lo sé') {
    ethicsAlerts.push('Debes confirmar si habrá tratamiento de datos personales para definir las garantías de protección de datos.');
  }

  if (values.vulnerable === 'Sí') {
    ethicsAlerts.push('Participantes vulnerables detectados: aplica medidas reforzadas de protección, lenguaje adaptado y supervisión ética estricta.');
  } else if (values.vulnerable === 'No lo sé') {
    ethicsAlerts.push('Aclara si existen participantes vulnerables para ajustar riesgos, consentimiento y revisión ética.');
  }

  const isReview = studyType === 'Revisión sistemática' || studyType === 'Scoping review';

  const title = values.idea
    ? `${values.idea.trim()} en ${values.population || 'población por definir'}`
    : `Propuesta inicial de ${values.projectType || 'proyecto de investigación'}`;

  const question = isReview
    ? `¿Qué evidencia disponible existe sobre ${values.idea || 'el tema propuesto'} en ${values.area || 'el área seleccionada'}?`
    : `¿Cómo se relaciona ${values.idea || 'la exposición/intervención de interés'} con ${values.mainVariable || 'el resultado principal'} en ${values.population || 'la población objetivo'}?`;

  const overallGoal = isReview
    ? `Sintetizar la evidencia sobre ${values.idea || 'el tema de interés'} para apoyar decisiones académicas o clínicas.`
    : `Evaluar ${values.idea || 'el fenómeno de interés'} en ${values.population || 'la población definida'} mediante un diseño ${studyType.toLowerCase()}.`;

  const specificGoals = isReview
    ? [
        'Definir criterios de elegibilidad y pregunta estructurada (PICO/PCC).',
        'Realizar búsqueda bibliográfica reproducible en bases de datos relevantes.',
        'Sintetizar hallazgos, sesgos y vacíos de investigación.'
      ]
    : [
        `Describir las características de ${values.population || 'la muestra objetivo'}.`,
        `Medir ${values.mainVariable || 'la variable principal'} con instrumentos válidos.`,
        'Explorar factores asociados y posibles variables de confusión.'
      ];

  const variables = isReview
    ? [
        'Base de datos consultada y estrategia de búsqueda',
        'Criterios de inclusión/exclusión',
        'Tipo de estudio y características de las publicaciones',
        'Resultados clave y riesgo de sesgo'
      ]
    : [
        values.mainVariable || 'Variable resultado principal',
        'Variable de exposición/intervención principal',
        'Variables sociodemográficas mínimas (edad, sexo u otras pertinentes)',
        'Variables de confusión potenciales'
      ];

  if (studyType === 'Ensayo clínico') {
    methodAlerts.push('Si propones ensayo clínico, define aleatorización, comparador y plan de seguridad.');
  }
  if (studyType === 'Cualitativo') {
    methodAlerts.push('En estudios cualitativos especifica muestreo teórico, saturación y método de análisis.');
  }
  if (isReview) {
    methodAlerts.push('Para revisiones, registra protocolo (p. ej., PROSPERO si aplica) y sigue PRISMA/PRISMA-ScR.');
    ethicsAlerts.push('Revisión bibliográfica: normalmente sin intervención directa en personas, pero mantén integridad científica y manejo transparente de sesgos.');
  }

  const checklist = [
    'Pregunta de investigación clara y delimitada.',
    'Objetivos alineados con el diseño propuesto.',
    'Variables y plan de análisis preliminar definidos.',
    'Valoración de riesgos y consideraciones éticas básicas.',
    'Documentación preparada para tutor/CEI/CEIm según corresponda.'
  ];

  return {
    title,
    question,
    overallGoal,
    specificGoals,
    studyType,
    variables,
    warnings,
    methodAlerts,
    ethicsAlerts,
    checklist
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
    '1) Título provisional',
    data.title,
    '',
    '2) Pregunta de investigación inicial',
    data.question,
    '',
    '3) Objetivo general',
    data.overallGoal,
    '',
    '4) Objetivos específicos',
    ...data.specificGoals.map((goal, idx) => `${idx + 1}. ${goal}`),
    '',
    '5) Diseño metodológico sugerido',
    data.studyType,
    '',
    '6) Variables mínimas recomendadas',
    ...data.variables.map((item, idx) => `${idx + 1}. ${item}`),
    '',
    '7) Alertas metodológicas',
    ...(data.methodAlerts.length ? data.methodAlerts : ['Sin alertas metodológicas críticas detectadas.']),
    '',
    '8) Alertas éticas básicas',
    ...(data.ethicsAlerts.length ? data.ethicsAlerts : ['Sin alertas éticas adicionales más allá de la revisión estándar.']),
    '',
    '9) Advertencias por campos incompletos',
    ...(data.warnings.length ? data.warnings : ['No se detectaron advertencias por campos vacíos.']),
    '',
    '10) Checklist previo al envío a tutor/comité ético',
    ...data.checklist.map((item, idx) => `[ ] ${idx + 1}. ${item}`),
    '',
    'Nota: Este borrador orienta la planificación inicial y no sustituye la revisión académica o ética formal.'
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
