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
const totalSteps = 27;
let latestDraftText = '';
let latestValues = null;
let latestDraftData = null;

const PENDING = 'Pendiente de completar por el investigador principal.';
const MAY_NOT_APPLY = 'Este apartado puede no aplicar según el tipo de estudio y debe ser revisado por el investigador principal.';
const INSUFFICIENT = 'Información insuficiente. Pendiente de completar por el investigador principal.';
const NOTE = 'Este documento es un borrador orientativo generado como ayuda para el diseño inicial de un proyecto de investigación. No sustituye la revisión metodológica, ética, legal ni la evaluación por el CEI correspondiente. El investigador principal es responsable de revisar, completar, justificar y adaptar el protocolo a la normativa vigente, al centro y al tipo de investigación.';

const ACTION_VERBS = ['evaluar', 'analizar', 'describir', 'determinar', 'comparar', 'estimar', 'identificar', 'validar', 'desarrollar', 'explorar', 'medir', 'estudiar'];
const value = (id) => document.getElementById(id).value.trim();
const sanitizeText = (text, fallback = PENDING) => {
  if (!text) return fallback;
  const cleaned = text.trim();
  if (cleaned.length < 10) return INSUFFICIENT;
  if (/^(asd|test|prueba|xxx|123|na|n\/a)$/i.test(cleaned)) return INSUFFICIENT;
  return cleaned;
};

function collectValues() { return { projectType:value('projectType'), area:value('area'), title:value('title'), question:value('question'), picoPopulation:value('picoPopulation'), picoIntervention:value('picoIntervention'), picoComparator:value('picoComparator'), picoOutcome:value('picoOutcome'), justification:value('justification'), mainObjective:value('mainObjective'), secondaryObjectives:value('secondaryObjectives'), studyType:value('studyType'), population:value('population'), inclusionCriteria:value('inclusionCriteria'), exclusionCriteria:value('exclusionCriteria'), mainVariable:value('mainVariable'), secondaryVariables:value('secondaryVariables'), dataSource:value('dataSource'), personalData:value('personalData'), vulnerable:value('vulnerable'), biologicalSamples:value('biologicalSamples'), interventionPatients:value('interventionPatients'), medProducts:value('medProducts'), informedConsent:value('informedConsent'), sampleSize:value('sampleSize'), timeline:value('timeline'), center:value('center'), principalInvestigator:value('principalInvestigator')}; }

function buildAlerts(v){const a=[]; if((v.title||'').length>0 && v.title.length<12)a.push('Revisión recomendada: título demasiado corto.'); if(v.mainObjective&&!ACTION_VERBS.some((x)=>v.mainObjective.toLowerCase().startsWith(x)))a.push('Revisión recomendada: formule el objetivo principal con un verbo de acción.'); if(!v.mainVariable)a.push('Revisión recomendada: falta variable principal.'); if(/casos y controles/i.test(v.studyType)&&/intervenci/i.test(v.mainObjective))a.push('Revisión recomendada: el diseño casos y controles no suele ser el más adecuado para evaluar impacto de una intervención prospectiva.'); return a;}

function buildChecklist(v){
  const c=['Revisar coherencia entre pregunta, objetivo, diseño y variables.'];
  c.push('Confirmar si el estudio utiliza datos personales o clínicos y definir las garantías de protección de datos.');
  c.push('Confirmar si participan personas vulnerables y justificar medidas adicionales de protección.');
  c.push('Confirmar si se utilizarán muestras biológicas y revisar normativa aplicable.');
  c.push('Confirmar si existe intervención sobre pacientes y valorar consentimiento informado.');
  c.push('Confirmar si se utilizan medicamentos/productos sanitarios y valorar RD 957/2020 o RD 1090/2015.');
  c.push('Confirmar la necesidad de consentimiento informado o solicitud formal de exención.');
  if(v.personalData==='Sí') c.push('Aplicar base legal, minimización de datos y seudonimización con trazabilidad.');
  if(v.vulnerable==='Sí') c.push('Añadir medidas reforzadas de información, protección y seguimiento de participantes vulnerables.');
  return c;
}

function buildDraft(v){
  const sample = v.sampleSize ? sanitizeText(v.sampleSize) : 'No se ha definido tamaño muestral. Orientación metodológica: justificar según diseño, variable principal, efecto mínimo relevante, precisión, potencia, alfa, pérdidas esperadas y factibilidad local, sin inventar cifras.';
  const checklist = buildChecklist(v);
  return { note: NOTE, checklist, sections: {
    'Título': sanitizeText(v.title), 'Versión y fecha': `Versión 1.0 · ${new Date().toISOString().slice(0,10)}`,
    'Investigador principal': sanitizeText(v.principalInvestigator), 'Promotor': MAY_NOT_APPLY,
    'Resumen estructurado': `Proyecto ${sanitizeText(v.projectType, MAY_NOT_APPLY)} en área ${sanitizeText(v.area, MAY_NOT_APPLY)}.`,
    'Justificación': sanitizeText(v.justification),
    'Pregunta de investigación': sanitizeText(v.question),
    'Hipótesis': MAY_NOT_APPLY,
    'Objetivo principal': sanitizeText(v.mainObjective),
    'Objetivos secundarios': sanitizeText(v.secondaryObjectives),
    'Diseño del estudio': sanitizeText(v.studyType),
    'Ámbito y población': `${sanitizeText(v.center, MAY_NOT_APPLY)}. Población: ${sanitizeText(v.population, MAY_NOT_APPLY)}.`,
    'Criterios de inclusión/exclusión': `Inclusión: ${sanitizeText(v.inclusionCriteria)}. Exclusión: ${sanitizeText(v.exclusionCriteria)}.`,
    'Variables': `Principal: ${sanitizeText(v.mainVariable)}. Secundarias: ${sanitizeText(v.secondaryVariables)}.`,
    'Fuente de datos': sanitizeText(v.dataSource), 'Tamaño muestral': sample,
    'Análisis estadístico orientativo': MAY_NOT_APPLY,
    'Gestión de datos y confidencialidad': v.personalData==='Sí'?'Aplicar minimización, control de acceso, registro de accesos y seudonimización con evaluación de impacto según proceda.':MAY_NOT_APPLY,
    'Consideraciones éticas': 'Valorar aprobación CEI/CEIm, balance beneficio-riesgo, protección de participantes y cumplimiento normativo específico del estudio.',
    'Consentimiento informado': sanitizeText(v.informedConsent, PENDING), 'Riesgos y beneficios': MAY_NOT_APPLY, 'Limitaciones': MAY_NOT_APPLY,
    'Plan de trabajo': sanitizeText(v.timeline),
    'Difusión de resultados': 'Definir estrategia de comunicación científica, difusión responsable y publicación siguiendo guías de transparencia y autoría.',
    'Documentación/anexos recomendados': 'Protocolo, hoja de información, consentimiento/exención, memoria económica, compromiso IP, autorización del centro, CRD, dictamen CEI, póliza si aplica, protección de datos y CV abreviado.'
  }};
}

function formatDraft(d){const lines=[d.note,'']; let i=1; Object.entries(d.sections).forEach(([k,v])=>{lines.push(`${i}. ${k}`); lines.push(v); lines.push(''); i+=1;}); lines.push('Checklist final para el investigador'); d.checklist.forEach((c)=>lines.push(`[ ] ${c}`)); return lines.join('\n');}
function renderAlerts(a){validationAlerts.innerHTML = a.length ? `<div class="alert-box">${a.map((x)=>`<p>⚠️ ${x}</p>`).join('')}</div>` : '';}
function updateChecklist(items){dynamicChecklist.innerHTML=''; items.forEach((it)=>{const li=document.createElement('li'); li.textContent=it; dynamicChecklist.appendChild(li);});}
function updateProgress(){const v=collectValues(); const filled=Object.values(v).filter(Boolean).length; const currentStep=Math.min(Math.max(filled,1),totalSteps); const percent=Math.max(0,Math.min(100,Math.round((currentStep/totalSteps)*100))); progressBar.style.width=`${percent}%`; progressText.textContent=`Paso ${currentStep} de ${totalSteps}`; progressPercent.textContent=`${percent}%`;
  const track=document.querySelector('.progress-track');
  if(track) track.setAttribute('aria-valuenow', String(percent));}

form.addEventListener('input', ()=>{const v=collectValues(); renderAlerts(buildAlerts(v)); updateProgress();});
form.addEventListener('submit', (e)=>{e.preventDefault(); const v=collectValues(); const d=buildDraft(v); const t=formatDraft(d); latestValues=v; latestDraftData=d; latestDraftText=t; output.querySelector('.status-message').textContent='Borrador generado correctamente.'; previewText.textContent=t; updateChecklist(d.checklist); downloadPdfButton.disabled=false;});
copyButton.addEventListener('click', async ()=>{if(!latestDraftText)return; await navigator.clipboard.writeText(latestDraftText);});
downloadPdfButton.addEventListener('click', ()=>{ if(latestValues&&latestDraftData&&window.generateProtocolPdf) window.generateProtocolPdf(latestValues, latestDraftData);});
resetButton.addEventListener('click', ()=>{form.reset(); latestValues=null; latestDraftData=null; latestDraftText=''; previewText.textContent='Aún no hay contenido generado.'; output.querySelector('.status-message').textContent='Completa el formulario y pulsa “Generar borrador”.'; validationAlerts.innerHTML=''; downloadPdfButton.disabled=true; updateChecklist(['Genera un borrador para ver la checklist personalizada.']); updateProgress();});

document.querySelectorAll('.tab-btn').forEach((btn)=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab-btn,.tab-panel').forEach((el)=>el.classList.remove('active')); btn.classList.add('active'); document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');}));
updateProgress();
