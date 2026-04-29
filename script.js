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
const totalSteps = 25;
let latestDraftText = '';
let latestValues = null;
let latestDraftData = null;

const PENDING = 'Pendiente de completar por el investigador principal';
const MAY_NOT_APPLY = 'Este apartado puede no aplicar según el tipo de estudio y debe ser revisado por el investigador principal';
const NOTE = 'Este documento es un borrador orientativo generado como ayuda para el diseño inicial de un proyecto de investigación. No sustituye la revisión metodológica, ética, legal ni la evaluación por el CEI correspondiente. El investigador principal es responsable de revisar, completar, justificar y adaptar el protocolo a la normativa vigente, al centro y al tipo de investigación.';

const ACTION_VERBS = ['evaluar', 'analizar', 'determinar', 'describir', 'comparar', 'identificar', 'estimar', 'explorar'];
const value = (id) => document.getElementById(id).value.trim();
const p = (text) => (text ? text : PENDING);

function collectValues() { return { projectType:value('projectType'), area:value('area'), title:value('title'), question:value('question'), picoPopulation:value('picoPopulation'), picoIntervention:value('picoIntervention'), picoComparator:value('picoComparator'), picoOutcome:value('picoOutcome'), justification:value('justification'), mainObjective:value('mainObjective'), secondaryObjectives:value('secondaryObjectives'), studyType:value('studyType'), population:value('population'), inclusionCriteria:value('inclusionCriteria'), exclusionCriteria:value('exclusionCriteria'), mainVariable:value('mainVariable'), secondaryVariables:value('secondaryVariables'), dataSource:value('dataSource'), personalData:value('personalData'), vulnerable:value('vulnerable'), biologicalSamples:value('biologicalSamples'), interventionPatients:value('interventionPatients'), medProducts:value('medProducts'), informedConsent:value('informedConsent'), sampleSize:value('sampleSize'), timeline:value('timeline'), center:value('center'), principalInvestigator:value('principalInvestigator')}; }

function buildAlerts(v){const a=[]; if((v.title||'').length>0 && v.title.length<12)a.push('Revisión recomendada: título demasiado corto.'); if(v.mainObjective&&!ACTION_VERBS.some((x)=>v.mainObjective.toLowerCase().startsWith(x)))a.push('Revisión recomendada: formule el objetivo principal con un verbo de acción.'); if(!v.mainVariable)a.push('Revisión recomendada: falta variable principal.'); if(/casos y controles/i.test(v.studyType)&&/intervenci/i.test(v.mainObjective))a.push('Revisión recomendada: el diseño casos y controles no suele ser el más adecuado para evaluar impacto de una intervención prospectiva.'); return a;}

function buildChecklist(v){const c=['Revisar coherencia entre pregunta, objetivo, diseño y variables.']; const add=(cond,text)=>{if(cond)c.push(text)}; add(v.personalData==='Sí','Protección de datos: base legal, seudonimización y autorización del centro.'); add(v.biologicalSamples==='Sí','Muestras biológicas: evaluación CEI y normativa de investigación biomédica.'); add(v.interventionPatients==='Sí','Intervención: evaluación beneficio/riesgo y consentimiento informado.'); add(v.medProducts==='Sí','Medicamentos/productos sanitarios: valorar RD 957/2020 o RD 1090/2015.'); add(v.vulnerable==='Sí','Participantes vulnerables: reforzar garantías éticas y documentación.'); ['personalData','vulnerable','biologicalSamples','interventionPatients','medProducts','informedConsent'].forEach((k)=>add(v[k]==='No lo sé',`Campo ${k}: requiere revisión por tutor/CEI.`)); return c;}

function buildDraft(v){
  const sample = v.sampleSize ? v.sampleSize : `No se ha definido tamaño muestral. Orientación metodológica: justificar según diseño, variable principal, efecto mínimo relevante, precisión, potencia, alfa, pérdidas esperadas y factibilidad local, sin inventar cifras.`;
  const checklist = buildChecklist(v);
  return { note: NOTE, checklist, sections: {
    'Título': p(v.title), 'Versión y fecha': `Versión 1.0 · ${new Date().toISOString().slice(0,10)}`,
    'Investigador principal': p(v.principalInvestigator), 'Promotor': MAY_NOT_APPLY,
    'Resumen estructurado': `Proyecto ${p(v.projectType)} en área ${p(v.area)}.`, 'Justificación': p(v.justification), 'Pregunta de investigación': p(v.question), 'Hipótesis': MAY_NOT_APPLY,
    'Objetivo principal': p(v.mainObjective), 'Objetivos secundarios': p(v.secondaryObjectives), 'Diseño del estudio': p(v.studyType), 'Ámbito y población': `${p(v.center)}. Población: ${p(v.population)}.`,
    'Criterios de inclusión/exclusión': `Inclusión: ${p(v.inclusionCriteria)}. Exclusión: ${p(v.exclusionCriteria)}.`, 'Variables': `Principal: ${p(v.mainVariable)}. Secundarias: ${p(v.secondaryVariables)}.`,
    'Fuente de datos': p(v.dataSource), 'Tamaño muestral': sample,
    'Análisis estadístico orientativo': MAY_NOT_APPLY, 'Gestión de datos y confidencialidad': v.personalData==='Sí'?'Aplicar minimización, control de acceso y seudonimización.':MAY_NOT_APPLY,
    'Consideraciones éticas': MAY_NOT_APPLY, 'Consentimiento informado': v.informedConsent || PENDING, 'Riesgos y beneficios': MAY_NOT_APPLY, 'Limitaciones': MAY_NOT_APPLY,
    'Plan de trabajo': p(v.timeline), 'Difusión de resultados': MAY_NOT_APPLY, 'Documentación/anexos recomendados': 'Protocolo, hoja de información, consentimiento/exención, memoria económica, compromiso IP, autorización del centro, CRD, dictamen CEI, póliza si aplica, protección de datos, CV abreviado.'
  }};
}

function formatDraft(d){const lines=[d.note,'']; let i=1; Object.entries(d.sections).forEach(([k,v])=>{lines.push(`${i}. ${k}`); lines.push(v); lines.push(''); i+=1;}); lines.push('Checklist final para el investigador'); d.checklist.forEach((c)=>lines.push(`[ ] ${c}`)); return lines.join('\n');}
function renderAlerts(a){validationAlerts.innerHTML = a.length ? a.map((x)=>`<p>⚠️ ${x}</p>`).join('') : '';}
function updateChecklist(items){dynamicChecklist.innerHTML=''; items.forEach((it)=>{const li=document.createElement('li'); li.textContent=it; dynamicChecklist.appendChild(li);});}
function updateProgress(){const v=collectValues(); const filled=Object.values(v).filter(Boolean).length; const percent=Math.max(4,Math.round((filled/totalSteps)*100)); progressBar.style.width=`${percent}%`; progressText.textContent=`Paso ${Math.max(1,filled)} de ${totalSteps}`; progressPercent.textContent=`${percent}%`;}

form.addEventListener('input', ()=>{const v=collectValues(); renderAlerts(buildAlerts(v)); updateProgress();});
form.addEventListener('submit', (e)=>{e.preventDefault(); const v=collectValues(); const d=buildDraft(v); const t=formatDraft(d); latestValues=v; latestDraftData=d; latestDraftText=t; output.querySelector('.status-message').textContent='Borrador generado correctamente.'; previewText.textContent=t; updateChecklist(d.checklist); downloadPdfButton.disabled=false;});
copyButton.addEventListener('click', async ()=>{if(!latestDraftText)return; await navigator.clipboard.writeText(latestDraftText);});
downloadPdfButton.addEventListener('click', ()=>{ if(latestValues&&latestDraftData&&window.generateProtocolPdf) window.generateProtocolPdf(latestValues, latestDraftData);});
resetButton.addEventListener('click', ()=>{form.reset(); latestValues=null; latestDraftData=null; latestDraftText=''; previewText.textContent='Aún no hay contenido generado.'; output.querySelector('.status-message').textContent='Completa el formulario y pulsa “Generar borrador”.'; validationAlerts.innerHTML=''; downloadPdfButton.disabled=true; updateChecklist(['Genera un borrador para ver la checklist personalizada.']); updateProgress();});

document.querySelectorAll('.tab-btn').forEach((btn)=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab-btn,.tab-panel').forEach((el)=>el.classList.remove('active')); btn.classList.add('active'); document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');}));
updateProgress();
