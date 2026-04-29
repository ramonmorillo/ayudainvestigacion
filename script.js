const form = document.getElementById('projectForm');
const output = document.getElementById('output');
const copyButton = document.getElementById('copyButton');
const downloadReadinessButton = document.getElementById('downloadReadinessButton');
const downloadProtocolButton = document.getElementById('downloadProtocolButton');
const downloadDocxButton = document.getElementById('downloadDocxButton');
const resetButton = document.getElementById('resetButton');
const previewText = document.getElementById('previewText');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const validationAlerts = document.getElementById('validationAlerts');
const dynamicChecklist = document.getElementById('dynamicChecklist');
const maturityCard = document.getElementById('maturityCard');
const maturityStatus = document.getElementById('maturityStatus');
const maturityCompletion = document.getElementById('maturityCompletion');
const maturityCompleted = document.getElementById('maturityCompleted');
const maturityPending = document.getElementById('maturityPending');
const maturityRecommendation = document.getElementById('maturityRecommendation');
const totalSteps = 29;
let latestDraftText = '';
let latestValues = null;
let latestDraftData = null;
let latestReadiness = null;
let latestQualityScore = 0;
let latestQualityBreakdown = null;

const PENDING = 'Pendiente de completar por el investigador principal.';
const MAY_NOT_APPLY = 'Este apartado puede no aplicar según el tipo de estudio y debe ser revisado por el investigador principal.';
const SECTION_BLOCKED = 'Este apartado no puede desarrollarse adecuadamente con la información disponible.';
const NOTE = 'Este documento es un borrador orientativo generado como ayuda para el diseño inicial de un proyecto de investigación. No sustituye la revisión metodológica, ética, legal ni la evaluación por el CEI correspondiente. El investigador principal es responsable de revisar, completar, justificar y adaptar el protocolo a la normativa vigente, al centro y al tipo de investigación.';
const AUTHOR_CREDIT = 'Herramienta creada por Ramón Morillo. Abril de 2026.';

const ACTION_VERBS = ['evaluar', 'analizar', 'describir', 'determinar', 'comparar', 'estimar', 'identificar', 'validar', 'desarrollar', 'explorar', 'medir', 'estudiar'];
const value = (id) => (document.getElementById(id)?.value || '').trim();
const criticalFields = [
  { key: 'title', label: 'Título' },
  { key: 'question', label: 'Pregunta de investigación' },
  { key: 'mainObjective', label: 'Objetivo principal' },
  { key: 'studyType', label: 'Diseño' },
  { key: 'population', label: 'Población' },
  { key: 'mainVariable', label: 'Variable principal' },
  { key: 'dataSource', label: 'Fuente de datos' },
  { key: 'personalData', label: 'Uso de datos personales/clínicos' },
  { key: 'interventionPatients', label: 'Intervención sobre pacientes' },
  { key: 'informedConsent', label: 'Consentimiento informado' }
];

const sanitizeText = (text, fallback = PENDING) => {
  if (!text) return fallback;
  const cleaned = text.trim();
  if (cleaned.length < 10) return SECTION_BLOCKED;
  if (/^(asd|test|prueba|xxx|123|na|n\/a)$/i.test(cleaned)) return SECTION_BLOCKED;
  return cleaned;
};

function collectValues() { return { templateSelector:value('templateSelector'), specialtySelector:value('specialtySelector'), specialMeasureSelector:value('specialMeasureSelector'), researchProfile:value('researchProfile'), disciplineArea:value('disciplineArea'), projectType:value('projectType'), area:value('area'), title:value('title'), question:value('question'), hypothesis:value('hypothesis'), picoPopulation:value('picoPopulation'), picoIntervention:value('picoIntervention'), picoComparator:value('picoComparator'), picoOutcome:value('picoOutcome'), justification:value('justification'), mainObjective:value('mainObjective'), secondaryObjectives:value('secondaryObjectives'), studyType:value('studyType'), population:value('population'), inclusionCriteria:value('inclusionCriteria'), exclusionCriteria:value('exclusionCriteria'), mainVariable:value('mainVariable'), secondaryVariables:value('secondaryVariables'), dataSource:value('dataSource'), personalData:value('personalData'), vulnerable:value('vulnerable'), biologicalSamples:value('biologicalSamples'), interventionPatients:value('interventionPatients'), medProducts:value('medProducts'), informedConsent:value('informedConsent'), sampleSize:value('sampleSize'), timeline:value('timeline'), center:value('center'), principalInvestigator:value('principalInvestigator')}; }

function profileGuidance(v) {
  const profile = (v.researchProfile || '').toLowerCase();
  if (profile === 'tfg') return 'En TFG: priorice una pregunta acotada, diseño viable y cronograma ajustado al curso académico.';
  if (profile === 'tfm') return 'En TFM: refuerce marco teórico, plan analítico y justificación metodológica con mayor profundidad.';
  if (profile === 'doctorado') return 'En doctorado: explicite originalidad, hipótesis robusta y plan de publicación por objetivos.';
  if (profile === 'residente sanitario') return 'Como residente sanitario: coordine tutor clínico, acceso a datos y tramitación ética temprana.';
  if (profile === 'profesional clínico') return 'Como profesional clínico: incorpore factibilidad asistencial, carga de trabajo y aplicabilidad clínica.';
  if (profile === 'investigador novel') return 'Como investigador novel: empiece por un diseño simple, variable principal clara y tutoría metodológica.';
  return 'Seleccione perfil para activar recomendaciones específicas de etapa investigadora.';
}

function isEssentialComplete(v, key) {
  const raw = (v[key] || '').trim();
  if (!raw) return false;
  if (['personalData', 'interventionPatients', 'informedConsent'].includes(key)) return raw !== 'No lo sé';
  return raw.length >= 6;
}

function evaluateProjectReadiness(v) {
  const hasMedicationSignals = /(pembrolizumab|nivolumab|inmunoterapia|anticuerpos?\s+monoclonales?|fármacos?|medicamentos?|producto\s+sanitario)/i.test(
    [v.title, v.question, v.mainObjective, v.picoIntervention, v.secondaryVariables, v.medProducts].join(' ')
  ) || v.medProducts === 'Sí';
  const completed = criticalFields.filter((f) => isEssentialComplete(v, f.key));
  const pending = criticalFields.filter((f) => !isEssentialComplete(v, f.key));
  const completion = Math.round((completed.length / criticalFields.length) * 100);
  let level = completion >= 90 ? 3 : completion >= 70 ? 2 : completion >= 45 ? 1 : 0;
  const regulatoryCritical = hasMedicationSignals && (v.interventionPatients === 'No lo sé' || v.informedConsent === 'No lo sé' || v.medProducts === 'No lo sé');
  if (regulatoryCritical) level = Math.max(0, level - 1);
  const statuses = ['Idea inicial insuficiente', 'Idea parcialmente definida', 'Borrador preliminar generable', 'Protocolo inicial razonablemente completo'];
  const status = statuses[level];
  const recommendation = level <= 1
    ? 'Completar antes de generar protocolo completo.'
    : 'Apto para borrador preliminar.';
  const maturityWarning = regulatoryCritical ? 'Borrador generable, pero con aspectos regulatorios críticos pendientes.' : '';
  return { status, completion, completed, pending, shouldGenerateProtocol: level >= 1, recommendation, maturityWarning, regulatoryCritical };
}



function buildGuidedJustification(v) {
  const magnitude = v.picoPopulation || v.population || 'la población objetivo';
  const current = v.dataSource || 'la práctica clínica actual';
  const gap = v.question || 'la pregunta de investigación aún no resuelta';
  const expected = v.mainObjective || 'la mejora de decisiones clínicas/metodológicas';
  return `Magnitud del problema: el proyecto aborda una necesidad relevante en ${magnitude}. Situación actual: la evidencia disponible en ${current} es heterogénea y con variabilidad de práctica. Gap de conocimiento: persisten incertidumbres sobre ${gap}. Valor esperado: el estudio puede aportar evidencia útil para ${expected} y mejorar la toma de decisiones.`;
}

function buildRecommendedBibliography(v) {
  const area = (v.area || '').toLowerCase();
  const topic = [v.title, v.question, v.mainVariable].join(' ').toLowerCase();
  const isOnco = /oncolog|cancer/.test(area + ' ' + topic);
  const isCardio = /cardio|insuficiencia|infarto|hipertensi/.test(area + ' ' + topic);
  const core = [
    'Guías clínicas: documento de sociedad científica principal del área (última versión).',
    'Ensayos pivotales: estudios fase III que sustentan el estándar terapéutico actual.',
    'Revisiones sistemáticas/meta-análisis recientes en PubMed/Cochrane.',
    'Real world evidence: cohortes multicéntricas y registros nacionales/internacionales.',
    'Normativa: RGPD/LOPDGDD, RD 957/2020 y RD 1090/2015 (si aplica).',
    'Metodología: STROBE/CONSORT/PRISMA según diseño.'
  ];
  if (isOnco) core.unshift('Oncología: priorizar guías ESMO/NCCN y outcomes RECIST, SG, SLP, PRO-CTCAE/PROM validados.');
  if (isCardio) core.unshift('Cardiología: priorizar guías ESC/AHA, endpoints MACE y definición estandarizada de eventos.');
  return core;
}

function detectClinicalIncoherence(v) {
  const text = [v.area, v.title, v.question, v.mainVariable, v.secondaryVariables].join(' ').toLowerCase();
  if (/oncolog|cancer/.test(text) && /artritis reumatoide/.test(text) && /hba1c/.test(text)) {
    return 'ALERTA ROJA: combinación clínica incoherente (oncología + artritis reumatoide + HbA1c) salvo justificación explícita de comorbilidad y objetivo metabólico.';
  }
  return '';
}

function improveHypothesis(v) {
  const raw = (v.hypothesis || '').trim();
  if (!raw || raw.length < 20 || /^el\s+\w+\s+es\s+mejor/i.test(raw)) {
    return `Hipótesis formal sugerida: En ${v.picoPopulation || 'la población definida'}, la intervención/exposición ${v.picoIntervention || 'de interés'} se asocia con ${v.picoOutcome || 'una mejoría clínicamente relevante en la variable principal'} frente a ${v.picoComparator || 'el comparador estándar'}, ajustando por factores de confusión preespecificados.`;
  }
  return raw;
}

function expectedBiasesByDesign(studyType = '') {
  const s = studyType.toLowerCase();
  if (s.includes('cohorte')) return ['Sesgo de selección', 'Confusión residual', 'Pérdidas durante seguimiento'];
  if (s.includes('casos')) return ['Sesgo de recuerdo', 'Sesgo de selección de controles', 'Confusión'];
  if (s.includes('ensayo')) return ['Sesgo de desempeño', 'Sesgo de detección', 'Pérdidas y desviaciones del protocolo'];
  if (s.includes('revisión')) return ['Sesgo de publicación', 'Heterogeneidad clínica/metodológica', 'Riesgo de sesgo de estudios incluidos'];
  return ['Sesgo de selección', 'Sesgo de información', 'Confusión'];
}

function computeQualityScore(v) {
  const text = (x) => (x || '').trim();
  const low = (x) => text(x).toLowerCase();
  const garbage = (x) => { const t = low(x); return t && (t.length < 8 || /(asdf|sdf|prueba|test|pembro.*buen[ií]simo)/i.test(t)); };
  const merged = [v.title, v.question, v.mainObjective, v.population, v.mainVariable, v.studyType].map(low).join(' ');
  const hasMedication = /(pembrolizumab|nivolumab|inmunoterapia|fármacos?|medicamentos?|producto\s+sanitario)/i.test(merged) || v.medProducts === 'Sí';
  const comparison = /(compar|frente|vs|mejor que|más eficaz)/i.test((v.question + ' ' + v.mainObjective).toLowerCase());
  const noStatsPlan = !text(v.statisticalPlan || v.analysisPlan || '');
  const hasActionVerb = ACTION_VERBS.some((verb) => low(v.mainObjective).startsWith(verb));
  const b = { question: 0, objective: 0, coherence: 0, population: 0, variables: 0, feasibility: 0, ethics: 0, stats: 0 };
  const reasons = [];
  const caps = [];

  if (!text(v.question) || !text(v.mainObjective)) caps.push({ max: 40, reason: 'Falta pregunta u objetivo principal' });
  if (!text(v.studyType)) caps.push({ max: 50, reason: 'Falta diseño' });
  if (!text(v.mainVariable)) caps.push({ max: 55, reason: 'Falta variable principal' });
  if (!text(v.population)) caps.push({ max: 55, reason: 'Falta población' });
  if (noStatsPlan) caps.push({ max: 75, reason: 'No hay plan estadístico' });
  if (!text(v.sampleSize)) caps.push({ max: 80, reason: 'No hay tamaño muestral justificado' });
  if ([v.question, v.mainObjective, v.population, v.mainVariable, v.studyType].some(garbage)) caps.push({ max: 35, reason: 'Texto basura en campos críticos' });

  b.question = !text(v.question) ? 0 : garbage(v.question) ? 0 : Math.min(15, (text(v.question).length > 20 ? 12 : 5) + (/(poblaci|pacient|adult|niñ|oncolog)/i.test(low(v.question)) ? 2 : 0) + (/(intervenci|trat|exposici|compar|vs)/i.test(low(v.question)) ? 1 : 0));
  if (garbage(v.mainObjective) || /(evaluar el objetivo|ver si funciona|estudiar cosas)/i.test(low(v.mainObjective))) b.objective = Math.min(3, text(v.mainObjective) ? 3 : 0);
  else b.objective = Math.min(15, (hasActionVerb ? 5 : 1) + (/(pacient|poblaci|adult|niñ)/i.test(low(v.mainObjective) + low(v.population)) ? 3 : 0) + (/(intervenci|trat|fármaco|exposici)/i.test(low(v.mainObjective) + low(v.picoIntervention)) ? 3 : 0) + (/(outcome|variable|supervivencia|mortalidad|hba1c|prom)/i.test(low(v.mainObjective) + low(v.mainVariable)) ? 4 : 0));
  b.coherence = Math.min(15, (text(v.studyType) ? 6 : 0) + (/(cohorte|ensayo|revisión|transversal|casos y controles)/i.test(low(v.studyType)) ? 4 : 0) + (comparison && text(v.picoComparator).length > 4 ? 5 : 0));
  if (comparison && !text(v.picoComparator)) reasons.push('Comparación sin comparador definido');
  if (/casos y controles/i.test(v.studyType) && /(eficacia|impacto|intervenci|prospectivo)/i.test(merged)) reasons.push('Diseño inadecuado para evaluar eficacia/impacto prospectivo');
  b.population = Math.min(10, (text(v.population) ? 4 : 0) + (/(pacient|adult|niñ|diagnostic|criterios?)/i.test(low(v.population)) ? 2 : 0) + (text(v.center) ? 2 : 0) + (text(v.inclusionCriteria) && text(v.exclusionCriteria) ? 2 : 0));
  b.variables = Math.min(15, (text(v.mainVariable) ? 5 : 0) + (/(supervivencia|mortalidad|respuesta|prom|hba1c)/i.test(low(v.mainVariable)) ? 2 : 0) + (text(v.secondaryVariables) ? 3 : 0) + (/(registro|historia|escala|instrumento|medici)/i.test(low(v.dataSource) + low(v.mainVariable)) ? 3 : 0) + (/(mes|año|semana|seguimiento|tiempo)/i.test([v.timeline, v.mainObjective, v.question].join(' ').toLowerCase()) ? 2 : 0));
  if (/prom/i.test(low(v.mainVariable)) && !/(eortc|eq-5d|sf-36|sf36|instrumento|escala)/i.test(low(v.mainVariable) + low(v.secondaryVariables))) b.variables = Math.min(8, b.variables);
  if (/(oncolog|cancer|mama|pembrolizumab)/i.test(merged) && /hba1c/i.test(low(v.mainVariable))) { b.variables = Math.min(3, b.variables); reasons.push('Variable principal incoherente con el tema (-20)'); }
  b.feasibility = Math.min(10, (text(v.dataSource) ? 4 : 0) + (/(20\d{2}|periodo|año|mes)/i.test(low(v.dataSource) + low(v.timeline)) ? 3 : 0) + (text(v.sampleSize) ? 3 : 0));
  if (/historias clínicas/i.test(v.dataSource || '') && !/(20\d{2}|periodo|año|mes)/i.test(low(v.dataSource) + low(v.timeline))) b.feasibility = Math.min(4, b.feasibility);
  b.ethics = Math.min(10, ((v.personalData === 'Sí' || v.personalData === 'No') ? 2 : 0) + ((v.informedConsent && v.informedConsent !== 'No lo sé') ? 2 : 0) + ((text(v.ethicsCommittee || v.cei || '')) ? 2 : 0) + ((hasMedication ? (text(v.regulatoryFramework || v.regulation || '') ? 2 : 0) : 2)) + (/(seudonim|anonimiz|protecci[oó]n de datos|rgpd)/i.test([v.informedConsent, v.justification].join(' ').toLowerCase()) ? 2 : 0));
  if (hasMedication && (v.informedConsent === 'No lo sé' || !text(v.ethicsCommittee || v.cei || '') || !text(v.regulatoryFramework || v.regulation || ''))) { b.ethics = Math.min(4, b.ethics); caps.push({ max: 60, reason: 'Medicamento/intervención sin CEI/consentimiento/regulación' }); reasons.push('Medicamento/eficacia sin ética-regulación clara (-20)'); }
  b.stats = noStatsPlan ? 1 : Math.min(10, (/(descriptiv|media|mediana|frecuencia)/i.test(low(v.statisticalPlan || v.analysisPlan || '')) ? 2 : 0) + (/(regresi|t de student|chi|anova|cox|kaplan|modelo)/i.test(low(v.statisticalPlan || v.analysisPlan || '')) ? 4 : 1) + (/(confusi|ajust)/i.test(low(v.statisticalPlan || v.analysisPlan || '') + low(v.studyType)) ? 2 : 0) + (/(faltantes|imputaci|p[eé]rdidas|sensibilidad)/i.test(low(v.statisticalPlan || v.analysisPlan || '')) ? 2 : 0));

  let score = Object.values(b).reduce((a, n) => a + n, 0);
  if (!text(v.dataSource)) { score -= 15; reasons.push('Ausencia de fuente de datos (-15)'); }
  if (!text(v.studyType)) { score -= 15; reasons.push('Ausencia de diseño (-15)'); }
  if (!text(v.mainVariable)) { score -= 15; reasons.push('Ausencia de variable principal (-15)'); }
  if (!text(v.population)) { score -= 15; reasons.push('Ausencia de población (-15)'); }
  if ([v.question, v.mainObjective, v.population, v.mainVariable, v.studyType].some(garbage)) score -= 30;
  if (/(oncolog|cancer|mama|pembrolizumab)/i.test(merged) && /artritis reumatoide/i.test(low(v.population))) { score -= 25; caps.push({ max: 45, reason: 'Incoherencia grave título-población-variable' }); }
  if ((text(v.question) && text(v.mainObjective)) && !/(supervivencia|mortalidad|eficacia|efectividad|asociaci|impacto|compar)/i.test((v.question + v.mainObjective).toLowerCase())) { score -= 20; reasons.push('Pregunta y objetivo no relacionados (-20)'); }
  if (/(oncolog|cancer|mama|pembrolizumab)/i.test(merged) && /hba1c/i.test(low(v.mainVariable))) score -= 20;

  score = Math.max(0, Math.min(100, score));
  if (caps.length) score = Math.min(score, Math.min(...caps.map((c) => c.max)));
  latestQualityBreakdown = { breakdown: b, reasons: [...new Set(reasons.concat(caps.map((c) => `${c.reason} (techo ${c.max})`)))].slice(0, 5), score };
  return score;
}

function buildAlerts(v){
  const a=[];
  const mergedText = [v.title, v.question, v.mainObjective, v.picoIntervention, v.studyType, v.mainVariable, v.secondaryVariables].join(' ').toLowerCase();
  const hasMedicationSignals = /(pembrolizumab|nivolumab|inmunoterapia|anticuerpos?\s+monoclonales?|fármacos?|medicamentos?|producto\s+sanitario)/i.test(mergedText) || v.medProducts === 'Sí';
  if((v.title||'').length>0 && v.title.length<12)a.push('Revisión recomendada: título demasiado corto.');
  if(v.mainObjective&&!ACTION_VERBS.some((x)=>v.mainObjective.toLowerCase().startsWith(x)))a.push('Revisión recomendada: formule el objetivo principal con un verbo de acción (ej.: evaluar, comparar, determinar, estimar).');
  if(!v.mainVariable)a.push('Revisión recomendada: concrete la variable principal y su forma de medición.');
  if(!v.population)a.push('Revisión recomendada: defina con precisión la población del estudio.');
  if(!v.dataSource)a.push('Revisión recomendada: especifique la fuente de datos y su accesibilidad.');
  if(/casos y controles/i.test(v.studyType) && (/intervenci/i.test(v.mainObjective) || /impacto/i.test(v.mainObjective)))a.push('Posible incoherencia: un diseño de casos y controles no suele ser apropiado para evaluar impacto de intervención.');
  if(/prom/i.test(v.mainVariable))a.push('Si usa PROM, especifique instrumento, versión, momento de medición y validación en población similar.');
  if(v.personalData==='Sí')a.push('Con datos clínicos/personales: documente seudonimización, autorización del centro y base legal del tratamiento.');
  if(v.medProducts==='Sí')a.push('Si hay medicamentos/productos sanitarios: revise aplicabilidad de RD 957/2020 o RD 1090/2015.');
  if(v.informedConsent==='No lo sé')a.push('Punto crítico: debe aclararse si se requiere consentimiento informado o exención justificada.');
  if (hasMedicationSignals) a.push('Valorar si el estudio se considera estudio observacional con medicamentos según RD 957/2020 o ensayo clínico según RD 1090/2015. Probable necesidad de CEIm.');
  if (/(eficacia|seguridad|supervivencia global|progresión|eventos adversos)/i.test(mergedText)) a.push('Defina claramente variable principal, periodo de seguimiento, fuente de datos y plan estadístico.');
  if (/medir supervivencia global/i.test((v.mainObjective || '').toLowerCase())) a.push('Sugerencia de reformulación: “Evaluar la supervivencia global en pacientes con cáncer de mama tratados con pembrolizumab en el periodo X.”');
  if (/es más alta que otros/i.test((v.question || '').toLowerCase()) || ((/compar|frente|vs/i.test(v.question+v.mainObjective) && !v.picoComparator))) a.push('La pregunta sugiere comparación pero falta comparador definido. Especifique grupo control/comparador.');
  if (/oncolog|cancer/i.test(mergedText) && /hba1c/i.test(mergedText)) a.push('Posible incoherencia: en oncología, HbA1c rara vez es outcome principal salvo contextos específicos.');
  if (/eficacia|efectividad/i.test(mergedText) && /casos y controles/i.test((v.studyType || '').toLowerCase())) a.push('Posible incoherencia: para eficacia de intervención, casos y controles suele no ser el diseño principal.');
  if (/supervivencia/i.test(mergedText) && /(n\s*[<≤]\s*100|[1-4]?\d\s+pacientes?)/i.test((v.population||'').toLowerCase())) a.push('Alerta: muestra pequeña para outcome de supervivencia puede comprometer potencia y validez.');
  if (/prospectivo/i.test((v.studyType || '').toLowerCase()) && hasMedicationSignals) a.push('Diseño prospectivo con posible medicamento: valorar intervención, seguimiento, consentimiento y evaluación ética/CEIm.');
  const incoherence = detectClinicalIncoherence(v);
  if (incoherence) a.push(incoherence);
  if ((v.population || '').trim().toLowerCase() === '100 pacientes') a.push('“100 pacientes” no implica justificación muestral. Debe indicarse si es muestra disponible, consecutiva o cálculo formal.');
  if (/prom/i.test((v.secondaryVariables || '').toLowerCase())) a.push('Para PROM en variables secundarias: indique instrumento validado, versión, idioma, momento de medición y criterio de interpretación.');
  return a;
}

function renderMaturityCard(readiness) {
  maturityCard.hidden = false;
  maturityStatus.textContent = readiness.status;
  maturityCompletion.textContent = `${readiness.completion}%`;
  maturityCompleted.innerHTML = readiness.completed.map((f) => `<li>${f.label}</li>`).join('') || '<li>Ninguno</li>';
  maturityPending.innerHTML = readiness.pending.map((f) => `<li>${f.label}</li>`).join('') || '<li>Ninguno</li>';
  maturityRecommendation.textContent = readiness.recommendation;
}

function buildChecklist(v){
  const c=['Revisar coherencia entre pregunta, objetivo, diseño y variables.'];
  c.push(profileGuidance(v));
  if (v.disciplineArea) c.push(`Área seleccionada: ${v.disciplineArea}. Verificar terminología y estándares metodológicos propios del área.`);
  c.push('Confirmar si el estudio utiliza datos personales o clínicos y definir las garantías de protección de datos.');
  c.push('Confirmar si participan personas vulnerables y justificar medidas adicionales de protección.');
  c.push('Confirmar si se utilizarán muestras biológicas y revisar normativa aplicable.');
  c.push('Confirmar si existe intervención sobre pacientes y valorar consentimiento informado.');
  c.push('Confirmar si se utilizan medicamentos/productos sanitarios y valorar RD 957/2020 o RD 1090/2015.');
  c.push('Confirmar la necesidad de consentimiento informado o solicitud formal de exención.');
  return c;
}

function buildDraft(v, readiness){
  const pendingInfo = readiness.pending.map((f) => f.label);
  const sample = v.sampleSize ? sanitizeText(v.sampleSize) : 'No se ha definido tamaño muestral. Se recomienda justificarlo según diseño, efecto esperado, precisión, potencia, alfa, pérdidas y factibilidad.';
  const blocked = 'Este apartado requiere ser completado porque condiciona la validez metodológica del estudio. Debe especificarse antes de presentar el proyecto a tutor, unidad metodológica o CEI/CEIm.';
  const guidedJustification = buildGuidedJustification(v);
  const recommendedBibliography = buildRecommendedBibliography(v);
  const improvedHypothesis = improveHypothesis(v);
  const biases = expectedBiasesByDesign(v.studyType);
  const qualityScore = computeQualityScore(v);
  latestQualityScore = qualityScore;
  const quality = latestQualityBreakdown || { breakdown: {}, reasons: [] };
  const qualityLevel = qualityScore <= 39 ? 'No preparado' : qualityScore <= 59 ? 'Idea inicial con problemas importantes' : qualityScore <= 74 ? 'Borrador preliminar mejorable' : qualityScore <= 89 ? 'Protocolo razonablemente sólido para revisión' : 'Protocolo muy sólido para revisión experta';
  return { mode: readiness.shouldGenerateProtocol ? 'protocol' : 'readiness', note: NOTE, checklist: buildChecklist(v), pendingInfo, sections: {
    'Perfil investigador inicial': sanitizeText(v.researchProfile, MAY_NOT_APPLY),
    'Área principal': sanitizeText(v.disciplineArea, MAY_NOT_APPLY),
    'Título': sanitizeText(v.title),
    'Versión y fecha': `Versión 1.0 · ${new Date().toISOString().slice(0,10)}`,
    'Investigador principal y equipo': sanitizeText(v.principalInvestigator, MAY_NOT_APPLY),
    'Promotor, si aplica': MAY_NOT_APPLY,
    'Justificación y contexto': sanitizeText(v.justification || guidedJustification, blocked),
    'Pregunta de investigación': sanitizeText(v.question, blocked),
    'Hipótesis, si procede': sanitizeText(improvedHypothesis, MAY_NOT_APPLY),
    'Objetivo principal': sanitizeText(v.mainObjective, blocked),
    'Objetivos secundarios': sanitizeText(v.secondaryObjectives, MAY_NOT_APPLY),
    'Diseño del estudio': sanitizeText(v.studyType, blocked),
    'Ámbito y población': `${sanitizeText(v.center, MAY_NOT_APPLY)}. Población: ${sanitizeText(v.population, blocked)}.`,
    'Criterios de inclusión': sanitizeText(v.inclusionCriteria, blocked),
    'Criterios de exclusión': sanitizeText(v.exclusionCriteria, blocked),
    'Variables': `Principal: ${sanitizeText(v.mainVariable, blocked)}. Secundarias: ${sanitizeText(v.secondaryVariables, MAY_NOT_APPLY)}.`,
    'Fuente de datos': sanitizeText(v.dataSource, blocked),
    'Tamaño muestral': sample,
    'Análisis estadístico orientativo': blocked,
    'Sesgos esperables según diseño': biases.join('. ') + '.',
    'Gestión de datos y confidencialidad': v.personalData==='Sí'?'Aplicar minimización, control de accesos, seudonimización y base legal del tratamiento con autorización institucional.':MAY_NOT_APPLY,
    'Consideraciones éticas': sanitizeText(v.informedConsent, blocked),
    'Consentimiento informado o exención': sanitizeText(v.informedConsent, blocked),
    'Riesgos y beneficios': blocked,
    'Limitaciones': blocked,
    'Plan de trabajo': sanitizeText(v.timeline, MAY_NOT_APPLY)
    ,'Difusión de resultados': blocked,
    'Documentación/anexos recomendados': 'Protocolo versionado, hoja de información al participante, consentimiento/exención, autorización de centro, plan de protección de datos y anexos técnicos aplicables.',
    'Checklist final para el investigador': 'Revise la checklist operativa del panel de salida antes de exportar el documento.',
    'Ayuda personalizada por perfil': profileGuidance(v),
    'Bibliografía recomendada inicial': recommendedBibliography.map((x, i) => `${i + 1}) ${x}`).join('\n'),
    'Score de calidad metodológica (0-100)': `Score de calidad metodológica: ${qualityScore}/100\nClasificación: ${qualityLevel}`,
    'Desglose del score metodológico': `Pregunta: ${quality.breakdown.question || 0}/15\nObjetivo: ${quality.breakdown.objective || 0}/15\nCoherencia: ${quality.breakdown.coherence || 0}/15\nPoblación: ${quality.breakdown.population || 0}/10\nVariables: ${quality.breakdown.variables || 0}/15\nFuente/factibilidad: ${quality.breakdown.feasibility || 0}/10\nÉtica/regulación: ${quality.breakdown.ethics || 0}/10\nEstadística: ${quality.breakdown.stats || 0}/10`,
    'Principales motivos que reducen el score': quality.reasons.length ? quality.reasons.map((r) => `- ${r}`).join('\n') : 'Sin penalizaciones críticas detectadas.'
  }};
}

function formatDraft(d, readiness){
  const lines=[d.note,'',`Nivel de madurez: ${readiness.status} (${readiness.completion}%)`,''];
  lines.push('Campos obligatorios mínimos: pregunta, objetivo, diseño, población, variable principal, fuente de datos y ética básica.');
  lines.push('');
  if (d.pendingInfo.length) {
    lines.push('Información pendiente de completar:');
    d.pendingInfo.forEach((p) => lines.push(`- ${p}`));
    lines.push('');
  }
  let i=1;
  Object.entries(d.sections).forEach(([k,v])=>{lines.push(`${i}. ${k}`); lines.push(v); lines.push(''); i+=1;});
  lines.push('Checklist final para el investigador');
  d.checklist.forEach((c)=>lines.push(`[ ] ${c}`));
  lines.push('','Recomendaciones inteligentes generadas por la herramienta');
  buildAlerts(latestValues || {}).slice(0,6).forEach((al)=>lines.push(`- ${al}`));
  lines.push('', AUTHOR_CREDIT);
  return lines.join('\n');
}

function renderAlerts(a){validationAlerts.innerHTML = a.length ? `<div class="alert-box">${a.map((x)=>`<p>⚠️ ${x}</p>`).join('')}</div>` : '';}
function updateChecklist(items){dynamicChecklist.innerHTML=''; items.forEach((it)=>{const li=document.createElement('li'); li.textContent=it; dynamicChecklist.appendChild(li);});}
function getCompletedFields(formData){
  let completed = 0;
  const ignoredStrings = new Set(['Seleccionar plantilla...', 'Seleccionar...', 'No lo sé']);
  for (const [key, value] of Object.entries(formData)) {
    const field = document.getElementById(key);
    if (field?.type === 'hidden' || field?.offsetParent === null) continue;
    if (value === null || value === undefined) continue;
    if (typeof value === 'string') {
      const clean = value.trim();
      if (clean !== '' && !ignoredStrings.has(clean)) completed += 1;
    } else if (typeof value === 'boolean') {
      if (value === true) completed += 1;
    } else if (Array.isArray(value)) {
      if (value.length > 0) completed += 1;
    }
  }
  return completed;
}

function updateProgress(){const v=collectValues(); const filled=getCompletedFields(v); const currentStep=Math.min(Math.max(filled,0),totalSteps); const percent=Math.max(0,Math.min(100,Math.round((currentStep/totalSteps)*100))); progressBar.style.width=`${percent}%`; progressText.textContent=`${currentStep} de ${totalSteps} campos completados`; progressPercent.textContent=`${percent}%`;
  const track=document.querySelector('.progress-track');
  if(track) track.setAttribute('aria-valuenow', String(percent));}

form.addEventListener('input', ()=>{const v=collectValues(); const readiness=evaluateProjectReadiness(v); latestReadiness=readiness; renderAlerts(buildAlerts(v)); renderMaturityCard(readiness); updateProgress();});
form.addEventListener('submit', (e)=>{e.preventDefault(); const v=collectValues(); const readiness=evaluateProjectReadiness(v); const d=buildDraft(v, readiness); const t=formatDraft(d, readiness); latestValues=v; latestDraftData=d; latestDraftText=t; latestReadiness=readiness; output.querySelector('.status-message').textContent = readiness.shouldGenerateProtocol ? 'Borrador generado correctamente.' : 'Madurez insuficiente: se generará un informe de madurez.'; previewText.textContent=t; updateChecklist(d.checklist); renderMaturityCard(readiness); downloadReadinessButton.disabled=false; downloadProtocolButton.disabled=false; if(downloadDocxButton) downloadDocxButton.disabled=false;});
copyButton.addEventListener('click', async ()=>{if(!latestDraftText)return; await navigator.clipboard.writeText(latestDraftText);});
downloadReadinessButton.addEventListener('click', ()=>{ if(latestValues&&latestDraftData&&latestReadiness&&window.generateProtocolPdf) window.generateProtocolPdf(latestValues, latestDraftData, latestReadiness, 'readiness');});
downloadProtocolButton.addEventListener('click', ()=>{ if(latestValues&&latestDraftData&&latestReadiness&&window.generateProtocolPdf){ const required=['question','mainObjective','studyType','population','mainVariable','dataSource']; const ethicsOk=latestValues.personalData!=='No lo sé' && latestValues.informedConsent!=='No lo sé'; const missing=required.filter((k)=>!(latestValues[k]||'').trim()); if(missing.length || !ethicsOk){ alert('Bloqueado: faltan campos mínimos para protocolo completo (título, objetivo, diseño, población, variable principal, fuente de datos y ética básica).'); return; } window.generateProtocolPdf(latestValues, latestDraftData, latestReadiness, 'protocol'); }});
resetButton.addEventListener('click', ()=>{form.reset(); latestValues=null; latestDraftData=null; latestDraftText=''; latestReadiness=null; previewText.textContent='Aún no hay contenido generado.'; output.querySelector('.status-message').textContent='Completa el formulario y pulsa “Generar borrador”.'; validationAlerts.innerHTML=''; downloadReadinessButton.disabled=true; downloadProtocolButton.disabled=true; if(downloadDocxButton) downloadDocxButton.disabled=true; maturityCard.hidden=true; updateChecklist(['Genera un borrador para ver la checklist personalizada.']); updateProgress();});

document.querySelectorAll('.tab-btn').forEach((btn)=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab-btn,.tab-panel').forEach((el)=>el.classList.remove('active')); btn.classList.add('active'); document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');}));
const aboutModal = document.getElementById('aboutModal');
document.getElementById('openAboutModal')?.addEventListener('click', ()=>{ if(aboutModal){ aboutModal.classList.add('open'); aboutModal.setAttribute('aria-hidden','false'); }});
document.getElementById('closeAboutModal')?.addEventListener('click', ()=>{ if(aboutModal){ aboutModal.classList.remove('open'); aboutModal.setAttribute('aria-hidden','true'); }});
aboutModal?.addEventListener('click', (event)=>{ if(event.target===aboutModal){ aboutModal.classList.remove('open'); aboutModal.setAttribute('aria-hidden','true'); }});
document.addEventListener('keydown', (event)=>{ if(event.key==='Escape' && aboutModal?.classList.contains('open')){ aboutModal.classList.remove('open'); aboutModal.setAttribute('aria-hidden','true'); }});
updateProgress();


const quickTemplates = [
  { value: '', label: 'Seleccionar plantilla...' },
  { value: 'tfg-tfm', label: 'TFG / TFM básico' },
  { value: 'cohorte-retrospectiva', label: 'Cohorte retrospectiva' },
  { value: 'cohorte-prospectiva', label: 'Cohorte prospectiva' },
  { value: 'casos-controles', label: 'Casos y controles' },
  { value: 'transversal', label: 'Estudio transversal' },
  { value: 'ensayo-intervencion', label: 'Ensayo clínico / intervención' },
  { value: 'revision-sistematica', label: 'Revisión sistemática' },
  { value: 'revision-narrativa', label: 'Revisión narrativa' },
  { value: 'validacion-cuestionario', label: 'Validación de cuestionario' },
  { value: 'cualitativo', label: 'Estudio cualitativo' },
  { value: 'serie-casos', label: 'Serie de casos' },
  { value: 'mejora-calidad', label: 'Proyecto de mejora de calidad' },
  { value: 'tesis-doctoral', label: 'Tesis doctoral (general)' }
];
const specialties = ['', 'General', 'Medicina', 'Enfermería', 'Farmacia', 'Oncología', 'Cardiología', 'Reumatología', 'Pediatría', 'Salud pública', 'Atención primaria', 'Psicología', 'Fisioterapia', 'Multidisciplinar', 'Otra'];
const specialMeasures = ['', 'PROM', 'PREM', 'Biomarcadores', 'Supervivencia', 'Costes', 'Calidad de vida', 'Eventos adversos', 'No aplica'];

function fillSelectOptions(selectId, options, includePlaceholder = false){
  const select = document.getElementById(selectId);
  if(!select) return;
  const normalized = includePlaceholder ? options : options.map((opt)=>({ value: opt, label: opt || 'Seleccionar...' }));
  select.innerHTML = normalized.map((opt)=>`<option value="${opt.value}">${opt.label}</option>`).join('');
}

fillSelectOptions('templateSelector', quickTemplates, true);
fillSelectOptions('specialtySelector', specialties);
fillSelectOptions('specialMeasureSelector', specialMeasures);

const templateMappings={
  'tfg-tfm':{researchProfile:'TFG',projectType:'TFG',studyType:'Estudio observacional'},
  'cohorte-retrospectiva':{studyType:'Cohorte retrospectiva'},
  'cohorte-prospectiva':{studyType:'Cohorte prospectiva'},
  'casos-controles':{studyType:'Casos y controles'},
  'transversal':{studyType:'Estudio transversal'},
  'ensayo-intervencion':{studyType:'Ensayo clínico'},
  'revision-sistematica':{studyType:'Revisión sistemática'},
  'revision-narrativa':{studyType:'Revisión narrativa'},
  'validacion-cuestionario':{studyType:'Validación de cuestionario',mainVariable:'Puntuación de cuestionario validado'},
  'cualitativo':{studyType:'Estudio cualitativo'},
  'serie-casos':{studyType:'Serie de casos'},
  'mejora-calidad':{studyType:'Proyecto de mejora de calidad'},
  'tesis-doctoral':{researchProfile:'Doctorado',projectType:'Tesis'}
};
const legacyTemplateMap={
  'TFG':'tfg-tfm',
  'cohorte':'cohorte-retrospectiva',
  'casos-control':'casos-controles',
  'ensayo':'ensayo-intervencion',
  'revision':'revision-sistematica',
  'farmacia-hospitalaria':'cohorte-retrospectiva',
  'oncologia':'cohorte-retrospectiva',
  'prom':'validacion-cuestionario'
};

function applyTemplateSmartHelp(v){
  if(v.templateSelector==='cohorte-retrospectiva' && v.specialtySelector==='Oncología' && v.specialMeasureSelector==='Supervivencia'){
    const hints=['tiempo-evento','Kaplan-Meier','Cox','criterios de inclusión claros','seguimiento'];
    const sv=document.getElementById('secondaryVariables');
    if(sv && !sv.value.trim()) sv.value = hints.join('; ');
  }
  if(v.templateSelector==='validacion-cuestionario' && (v.specialtySelector==='' || v.specialtySelector==='General') && v.specialMeasureSelector==='PROM'){
    const hints=['alfa de Cronbach','test-retest','validez de constructo','muestra recomendada'];
    const sv=document.getElementById('secondaryVariables');
    if(sv && !sv.value.trim()) sv.value = hints.join('; ');
  }
}

document.getElementById('templateSelector')?.addEventListener('change',(e)=>{const normalized=legacyTemplateMap[e.target.value]||e.target.value; if(normalized!==e.target.value)e.target.value=normalized; const t=templateMappings[normalized]||{};Object.entries(t).forEach(([k,v])=>{const el=document.getElementById(k);if(el)el.value=v;}); applyTemplateSmartHelp(collectValues()); updateProgress();});
document.getElementById('specialtySelector')?.addEventListener('change',()=>{const v=collectValues(); if(v.specialtySelector==='Otra'){const areaField=document.getElementById('area'); if(areaField && !areaField.value.trim()) areaField.placeholder='Especifique su especialidad';} if(v.specialtySelector && v.specialtySelector!=='Otra' && !document.getElementById('area')?.value.trim()) document.getElementById('area').value=v.specialtySelector; applyTemplateSmartHelp(v); updateProgress();});
document.getElementById('specialMeasureSelector')?.addEventListener('change',()=>{const v=collectValues(); if(v.specialMeasureSelector==='PROM' && !document.getElementById('mainVariable')?.value.trim()) document.getElementById('mainVariable').value='PROM validado'; applyTemplateSmartHelp(v); updateProgress();});

const zAlpha={0.05:1.96,0.01:2.58};const zPower={0.8:0.84,0.9:1.28};
document.getElementById('sampleCalcButton')?.addEventListener('click',()=>{const type=value('calcType');const a=parseFloat(value('calcAlpha'))||0.05;const p=parseFloat(value('calcPower'))||0.8;const d=parseFloat(value('calcEffect'))||0.5;const drop=(parseFloat(value('calcDropout'))||0)/100;const za=zAlpha[a]||1.96;const zb=zPower[p]||0.84;let n=0;if(type==='medias'){n=2*((za+zb)**2)/(d**2);}else if(type==='proporciones'){n=2*((za+zb)**2)*0.25/(d**2);}else{n=((za**2)*0.25)/(d**2);}const adjusted=Math.ceil(n/(1-drop));document.getElementById('sampleCalcResult').textContent=`n aproximado: ${Math.ceil(n)} (ajustado por pérdidas: ${adjusted})`;const ss=document.getElementById('sampleSize');if(ss && !ss.value) ss.value=`${adjusted} participantes (estimación rápida)`;updateProgress();});

if (downloadDocxButton) downloadDocxButton.addEventListener('click', ()=>{ if(latestValues&&latestDraftData&&latestReadiness&&window.generateProtocolDocx){ const required=['question','mainObjective','studyType','population','mainVariable','dataSource']; const ethicsOk=latestValues.personalData!=='No lo sé' && latestValues.informedConsent!=='No lo sé'; const missing=required.filter((k)=>!(latestValues[k]||'').trim()); if(missing.length || !ethicsOk){ alert('Bloqueado: faltan campos mínimos para exportar Word completo (pregunta, objetivo, diseño, población, variable principal, fuente de datos y ética básica).'); return; } window.generateProtocolDocx(latestValues, latestDraftData, latestReadiness, 'protocol'); }});
