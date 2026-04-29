(function () {
  const NOTE_TEXT = 'Este documento es un borrador orientativo. No sustituye la revisión metodológica, ética, legal, regulatoria ni la evaluación por el CEI/CEIm correspondiente. El investigador principal es responsable de revisar, completar, justificar y adaptar el protocolo a la normativa vigente, al centro y al tipo de investigación.';
  const CREDIT = 'Herramienta creada por Ramón Morillo. Abril de 2026.';

  window.generateProtocolPdf = function generateProtocolPdf(values, draftData, readiness, mode = 'protocol') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 16;
    const pageWidth = 210;
    const pageHeight = 297;
    const usableWidth = pageWidth - margin * 2;
    const footerY = pageHeight - 10;
    let y = 20;

    const ensure = (needed = 8) => {
      if (y + needed > footerY - 4) {
        doc.addPage();
        y = 18;
      }
    };
    const heading = (t, s = 12) => { ensure(10); doc.setFont(undefined, 'bold'); doc.setFontSize(s); doc.text(t, margin, y); y += 6; };
    const p = (t, s = 10) => { doc.setFont(undefined, 'normal'); doc.setFontSize(s); const lines = doc.splitTextToSize(t, usableWidth); ensure(lines.length * 5 + 2); doc.text(lines, margin, y); y += lines.length * 5 + 2; };
    const kv = (k, v) => p(`${k}: ${v || 'Pendiente'}`, 10);

    // Bloque 1 - Portada
    doc.setFont(undefined, 'bold');
    doc.setFontSize(24);
    doc.text('Protocolo de investigación', pageWidth / 2, 40, { align: 'center' });
    doc.setFontSize(16);
    doc.text('AyudaInvestigacion', pageWidth / 2, 52, { align: 'center' });
    y = 72;
    p(CREDIT, 10);
    kv('Fecha de generación', new Date().toISOString().slice(0, 10));
    kv('Versión del borrador', '1.0');
    kv('Título provisional del proyecto', values.title);
    kv('Investigador principal / tutor', values.principalInvestigator || 'No especificado');
    kv('Centro', values.center);
    kv('Tipo de proyecto', values.projectType);
    kv('Área', values.area);
    kv('Estado global de madurez', readiness.status);
    kv('Porcentaje de completitud', `${readiness.completion}%`);
    if (readiness.maturityWarning) p(`⚠ ${readiness.maturityWarning}`, 10);
    y = Math.max(y + 6, 225);
    p(NOTE_TEXT, 9);

    doc.addPage(); y = 20;
    heading('Resumen clave del proyecto', 16);
    [
      ['Pregunta de investigación', values.question],
      ['Objetivo principal', values.mainObjective],
      ['Diseño propuesto', values.studyType],
      ['Población', values.population],
      ['Intervención/exposición', values.picoIntervention],
      ['Comparador', values.picoComparator],
      ['Variable principal', values.mainVariable],
      ['Variables secundarias', values.secondaryVariables],
      ['Fuente de datos', values.dataSource],
      ['Tamaño muestral indicado o pendiente', values.sampleSize || 'Pendiente/por justificar'],
      ['Aspectos éticos críticos', values.informedConsent],
      ['Riesgos metodológicos detectados', (draftData.pendingInfo || []).join('; ') || 'No detectados'],
      ['Documentación probablemente necesaria', 'Protocolo, consentimiento/exención, autorización de centro, protección de datos']
    ].forEach(([k, v]) => kv(k, v));
    heading('Valoración inicial de la herramienta', 12);
    p('1. Fortalezas del proyecto: existe estructura preliminar para revisión por tutor/metodología.');
    p(`2. Puntos críticos pendientes: ${draftData.pendingInfo.length ? draftData.pendingInfo.join(', ') : 'No se identifican campos críticos pendientes.'}`);
    p('3. Recomendaciones antes de presentar a tutor/CEI/SICEIA: cerrar comparador, variable principal, plan estadístico, aspectos éticos y regulatorios.');

    doc.addPage(); y = 18;
    heading('Desarrollo completo del protocolo', 15);
    let idx = 1;
    Object.entries(draftData.sections).forEach(([k, v]) => { heading(`${idx}. ${k}`, 11); p(v, 10); idx += 1; });
    if (draftData.pendingInfo.length) { heading('Información crítica pendiente', 11); draftData.pendingInfo.forEach((x) => p(`- ${x}`, 10)); }

    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i += 1) {
      doc.setPage(i); doc.setFontSize(8); doc.setFont(undefined, 'normal');
      doc.text(`AyudaInvestigacion · ${CREDIT} · Página ${i}/${pages}`, pageWidth / 2, footerY, { align: 'center' });
    }

    const fileBase = mode === 'readiness' ? 'informe_madurez_proyecto' : 'protocolo_investigacion';
    doc.save(`${fileBase}_${new Date().toISOString().slice(0,10)}.pdf`);
  };
})();
