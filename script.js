const form = document.getElementById('projectForm');
const output = document.getElementById('output');
const copyButton = document.getElementById('copyButton');
const downloadPdfButton = document.getElementById('downloadPdfButton');
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
const totalSteps = 27;
let latestDraftText = '';
let latestValues = null;
let latestDraftData = null;
let latestReadiness = null;

const PENDING = 'Pendiente de completar por el investigador principal.';
const MAY_NOT_APPLY = 'Este apartado puede no aplicar según el tipo de estudio y debe ser revisado por el investigador principal.';
const SECTION_BLOCKED = 'Este apartado no puede desarrollarse adecuadamente con la información disponible.';
const NOTE = 'Este documento es un borrador orientativo generado como ayuda para el diseño inicial de un proyecto de investigación. No sustituye la revisión metodológica, ética, legal ni la evaluación por el CEI correspondiente. El investigador principal es responsable de revisar, completar, justificar y adaptar el protocolo a la normativa vigente, al centro y al tipo de investigación.';
const AUTHOR_CREDIT = 'Herramienta creada por Ramón Morillo. Abril de 2026.';

const ACTION_VERBS = ['evaluar', 'analizar', 'describir', 'determinar', 'comparar', 'estimar', 'identificar', 'validar', 'desarrollar', 'explorar', 'medir', 'estudiar'];
const value = (id) => document.getElementById(id).value.trim();
const essentialFields = [
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

function collectValues() { return { projectType:value('projectType'), area:value('area'), title:value('title'), question:value('question'), picoPopulation:value('picoPopulation'), picoIntervention:value('picoIntervention'), picoComparator:value('picoComparator'), picoOutcome:value('picoOutcome'), justification:value('justification'), mainObjective:value('mainObjective'), secondaryObjectives:value('secondaryObjectives'), studyType:value('studyType'), population:value('population'), inclusionCriteria:value('inclusionCriteria'), exclusionCriteria:value('exclusionCriteria'), mainVariable:value('mainVariable'), secondaryVariables:value('secondaryVariables'), dataSource:value('dataSource'), personalData:value('personalData'), vulnerable:value('vulnerable'), biologicalSamples:value('biologicalSamples'), interventionPatients:value('interventionPatients'), medProducts:value('medProducts'), informedConsent:value('informedConsent'), sampleSize:value('sampleSize'), timeline:value('timeline'), center:value('center'), principalInvestigator:value('principalInvestigator')}; }

function isEssentialComplete(v, key) {
  const raw = (v[key] || '').trim();
  if (!raw) return false;
  if (['personalData', 'interventionPatients', 'informedConsent'].includes(key)) return raw !== 'No lo sé';
  return raw.length >= 6;
}

function evaluateProjectReadiness(v) {
  const completed = essentialFields.filter((f) => isEssentialComplete(v, f.key));
  const pending = essentialFields.filter((f) => !isEssentialComplete(v, f.key));
  const completion = Math.round((completed.length / essentialFields.length) * 100);
  const missingRatio = pending.length / essentialFields.length;
  let status = 'Idea parcialmente definida';
  if (missingRatio > 0.5) status = 'Idea inicial insuficiente';
  else if (completion >= 90) status = 'Protocolo inicial razonablemente completo';
  else if (completion >= 70) status = 'Borrador preliminar generable';
  const recommendation = status === 'Idea inicial insuficiente'
    ? 'Complete los campos críticos antes de generar el protocolo.'
    : status === 'Idea parcialmente definida'
      ? 'Puede generar un borrador, pero debe revisarse con tutor/metodólogo.'
      : 'Borrador inicial suficientemente completo para revisión.';
  return { status, completion, completed, pending, shouldGenerateProtocol: missingRatio <= 0.5, recommendation };
}

function buildAlerts(v){
  const a=[];
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
  const blocked = 'Este apartado no puede desarrollarse adecuadamente con la información disponible.';
  return { mode: readiness.shouldGenerateProtocol ? 'protocol' : 'readiness', note: NOTE, checklist: buildChecklist(v), pendingInfo, sections: {
    'Título': sanitizeText(v.title),
    'Versión y fecha': `Versión 1.0 · ${new Date().toISOString().slice(0,10)}`,
    'Pregunta de investigación': sanitizeText(v.question, blocked),
    'Objetivo principal': sanitizeText(v.mainObjective, blocked),
    'Diseño del estudio': sanitizeText(v.studyType, blocked),
    'Ámbito y población': `${sanitizeText(v.center, MAY_NOT_APPLY)}. Población: ${sanitizeText(v.population, blocked)}.`,
    'Variables': `Principal: ${sanitizeText(v.mainVariable, blocked)}. Secundarias: ${sanitizeText(v.secondaryVariables, MAY_NOT_APPLY)}.`,
    'Fuente de datos': sanitizeText(v.dataSource, blocked),
    'Tamaño muestral': sample,
    'Gestión de datos y confidencialidad': v.personalData==='Sí'?'Aplicar minimización, control de accesos, seudonimización y base legal del tratamiento con autorización institucional.':MAY_NOT_APPLY,
    'Consideraciones éticas': sanitizeText(v.informedConsent, blocked),
    'Plan de trabajo': sanitizeText(v.timeline, MAY_NOT_APPLY)
  }};
}

function formatDraft(d, readiness){
  const lines=[d.note,'',`Nivel de madurez: ${readiness.status} (${readiness.completion}%)`,''];
  if (d.pendingInfo.length) {
    lines.push('Información pendiente de completar:');
    d.pendingInfo.forEach((p) => lines.push(`- ${p}`));
    lines.push('');
  }
  let i=1;
  Object.entries(d.sections).forEach(([k,v])=>{lines.push(`${i}. ${k}`); lines.push(v); lines.push(''); i+=1;});
  lines.push('Checklist final para el investigador');
  d.checklist.forEach((c)=>lines.push(`[ ] ${c}`));
  lines.push('', AUTHOR_CREDIT);
  return lines.join('\n');
}

function renderAlerts(a){validationAlerts.innerHTML = a.length ? `<div class="alert-box">${a.map((x)=>`<p>⚠️ ${x}</p>`).join('')}</div>` : '';}
function updateChecklist(items){dynamicChecklist.innerHTML=''; items.forEach((it)=>{const li=document.createElement('li'); li.textContent=it; dynamicChecklist.appendChild(li);});}
function updateProgress(){const v=collectValues(); const filled=Object.values(v).filter(Boolean).length; const currentStep=Math.min(Math.max(filled,1),totalSteps); const percent=Math.max(0,Math.min(100,Math.round((currentStep/totalSteps)*100))); progressBar.style.width=`${percent}%`; progressText.textContent=`Paso ${currentStep} de ${totalSteps}`; progressPercent.textContent=`${percent}%`;
  const track=document.querySelector('.progress-track');
  if(track) track.setAttribute('aria-valuenow', String(percent));}

form.addEventListener('input', ()=>{const v=collectValues(); const readiness=evaluateProjectReadiness(v); latestReadiness=readiness; renderAlerts(buildAlerts(v)); renderMaturityCard(readiness); updateProgress();});
form.addEventListener('submit', (e)=>{e.preventDefault(); const v=collectValues(); const readiness=evaluateProjectReadiness(v); const d=buildDraft(v, readiness); const t=formatDraft(d, readiness); latestValues=v; latestDraftData=d; latestDraftText=t; latestReadiness=readiness; output.querySelector('.status-message').textContent = readiness.shouldGenerateProtocol ? 'Borrador generado correctamente.' : 'Madurez insuficiente: se generará un informe de madurez.'; previewText.textContent=t; updateChecklist(d.checklist); renderMaturityCard(readiness); downloadPdfButton.disabled=false;});
copyButton.addEventListener('click', async ()=>{if(!latestDraftText)return; await navigator.clipboard.writeText(latestDraftText);});
downloadPdfButton.addEventListener('click', ()=>{ if(latestValues&&latestDraftData&&latestReadiness&&window.generateProtocolPdf) window.generateProtocolPdf(latestValues, latestDraftData, latestReadiness);});
resetButton.addEventListener('click', ()=>{form.reset(); latestValues=null; latestDraftData=null; latestDraftText=''; latestReadiness=null; previewText.textContent='Aún no hay contenido generado.'; output.querySelector('.status-message').textContent='Completa el formulario y pulsa “Generar borrador”.'; validationAlerts.innerHTML=''; downloadPdfButton.disabled=true; maturityCard.hidden=true; updateChecklist(['Genera un borrador para ver la checklist personalizada.']); updateProgress();});

document.querySelectorAll('.tab-btn').forEach((btn)=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab-btn,.tab-panel').forEach((el)=>el.classList.remove('active')); btn.classList.add('active'); document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');}));
updateProgress();
