(function () {
  const NOTE_TEXT = 'Este documento es un borrador orientativo generado como ayuda para el diseño inicial de un proyecto de investigación. No sustituye la revisión metodológica, ética, legal ni la evaluación por el CEI correspondiente. El investigador principal es responsable de revisar, completar, justificar y adaptar el protocolo a la normativa vigente, al centro y al tipo de investigación.';
  window.generateProtocolPdf = function generateProtocolPdf(values, draftData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const m = 15, w = 180, h = 297;
    let y = 20; let section = 1;
    const ensure = (n=10)=>{ if (y+n>280){ doc.addPage(); y=20; }};
    const p = (txt, sz=10)=>{ doc.setFontSize(sz); const l=doc.splitTextToSize(txt,w); ensure(l.length*5+3); doc.text(l,m,y); y+=l.length*5+3; };
    const box = (title,text)=>{ ensure(28); doc.setFillColor(255,248,225); doc.roundedRect(m,y,w,22,2,2,'F'); doc.setFont(undefined,'bold'); doc.text(title,m+2,y+5); doc.setFont(undefined,'normal'); doc.setFontSize(9); doc.text(doc.splitTextToSize(text,w-4),m+2,y+10); y+=26; };
    doc.setFont(undefined,'bold'); doc.setFontSize(18); doc.text('PROTOCOLO DE INVESTIGACIÓN',m,y); y+=10;
    doc.setFontSize(12); doc.setFont(undefined,'normal'); p(`AyudaInvestigacion · ${new Date().toISOString().slice(0,10)}`); p(`Título: ${draftData.sections['Título']}`); p(`Investigador principal: ${draftData.sections['Investigador principal']}`);
    box('Nota inicial obligatoria', NOTE_TEXT);
    p('Índice / estructura',11); Object.keys(draftData.sections).forEach((k)=>p(`${section++}. ${k}`,9));
    section = 1;
    Object.entries(draftData.sections).forEach(([k,v])=>{ ensure(14); doc.setFont(undefined,'bold'); doc.setFontSize(12); doc.text(`${section}. ${k}`,m,y); y+=6; doc.setFont(undefined,'normal'); p(v,10); if(/ética|consentimiento|datos/i.test(k)) box('Advertencia', 'Revisar este apartado con tutor/CEI y normativa vigente antes de su uso.'); section+=1; });
    ensure(20); doc.setFont(undefined,'bold'); doc.text('Checklist final',m,y); y+=6; doc.setFont(undefined,'normal'); draftData.checklist.forEach((c)=>p(`[ ] ${c}`,10));
    p('Documentación que puede ser necesaria para el CEI',11);
    p('Protocolo completo, hoja de información, consentimiento o exención, memoria económica si aplica, compromiso del IP, autorización del centro, CRD, dictamen CEI, póliza/seguro si aplica, protección de datos, CV abreviado.');
    const pages = doc.getNumberOfPages();
    for (let i=1;i<=pages;i+=1){ doc.setPage(i); doc.setFontSize(8); doc.text('AyudaInvestigacion',m,h-8); doc.text(`Página ${i}/${pages}`,195,h-8,{align:'right'}); }
    doc.save(`protocolo_investigacion_${new Date().toISOString().slice(0,10)}.pdf`);
  };
})();
