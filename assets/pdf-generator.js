(function () {
  const NOTE_TEXT = 'Este documento es un borrador orientativo generado como ayuda para el diseño inicial de un proyecto de investigación. No todos los apartados son aplicables a todos los tipos de estudios. El formato debe ser adaptado por el investigador principal según la naturaleza del proyecto, los requisitos del centro, el comité de ética, la normativa vigente y la metodología específica correspondiente. El investigador principal es el responsable último de revisar, completar, justificar y validar el contenido antes de su utilización.';

  function placeholder(text) {
    return text && text.trim() ? text.trim() : '[Pendiente de completar por el investigador principal]';
  }

  function splitText(doc, text, maxWidth) {
    return doc.splitTextToSize(text, maxWidth);
  }

  window.generateProtocolPdf = function generateProtocolPdf(values, draftData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    const addHeaderFooter = () => {
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i += 1) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(90);
        doc.text('AyudaInvestigacion – Borrador orientativo', margin, pageHeight - 8);
        doc.text(`Página ${i}/${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
      }
    };

    const ensureSpace = (needed = 8) => {
      if (y + needed > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    };

    const addParagraph = (text, fontSize = 11, gapAfter = 5, indent = 0) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(25);
      const lines = splitText(doc, text, contentWidth - indent);
      const lineHeight = fontSize * 0.38 + 1.5;
      ensureSpace(lines.length * lineHeight + gapAfter);
      doc.text(lines, margin + indent, y);
      y += lines.length * lineHeight + gapAfter;
    };

    const addSection = (title, body) => {
      ensureSpace(12);
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text(title, margin, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      addParagraph(body || 'Este apartado debe adaptarse según el tipo de estudio.');
    };

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);

    doc.setFont(undefined, 'bold');
    doc.setFontSize(18);
    doc.text('PROTOCOLO DE INVESTIGACIÓN (BORRADOR)', margin, y);
    y += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    addParagraph(`Título del estudio: ${placeholder(draftData.title)}`);
    addParagraph(`Fecha y versión del protocolo: ${dateStr} · Versión preliminar 0.1`);
    addParagraph('Investigador principal: [Pendiente de completar por el investigador principal]');
    addParagraph('Promotor (si aplica): Este apartado debe adaptarse según el tipo de estudio.');
    addParagraph('Responsables del estudio: [Pendiente de completar por el investigador principal]');

    ensureSpace(30);
    doc.setDrawColor(210);
    doc.setFillColor(255, 248, 225);
    const boxHeight = 44;
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('NOTA INICIAL OBLIGATORIA', margin + 3, y + 6);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(splitText(doc, NOTE_TEXT, contentWidth - 6), margin + 3, y + 12);
    y += boxHeight + 8;

    addSection('1. Resumen', `Título, versión y fecha: ${placeholder(draftData.title)}. ${dateStr}. Justificación y contexto: ${placeholder(draftData.briefJustification)} Hipótesis y objetivos: ${placeholder(draftData.overallGoal)} Diseño del estudio: ${placeholder(draftData.studyType)}. Población: ${placeholder(values.population)}. Variables: ${placeholder(values.mainVariable)}. Fuentes de datos: ${values.personalData === 'Sí' ? 'Incluye datos personales/clínicos. Debe detallarse la base jurídica y las medidas de protección.' : 'Este apartado debe adaptarse según el tipo de estudio.'} Tamaño del estudio: ${draftData.sampleSizeGuidance?.intro || 'Este apartado debe adaptarse según el tipo de estudio.'} Análisis de datos: ${draftData.analysisPlan?.join(' ') || 'Pendiente de completar.'} Etapas y calendario: ${draftData.checklist?.[0] || 'Pendiente de completar.'}`);
    addSection('2. Justificación y contexto', draftData.briefJustification);
    addSection('3. Hipótesis y objetivos de la investigación', `3.1 Hipótesis: ${placeholder(draftData.question)} 3.2 Objetivos: 3.2.1 Objetivo principal: ${placeholder(draftData.overallGoal)} 3.2.2 Objetivos secundarios: ${(draftData.specificGoals || ['[Pendiente de completar por el investigador principal]']).join(' ')}`);
    addSection('4. Diseño del estudio', `${placeholder(draftData.studyType)}. ${placeholder(draftData.designDescription)}`);
    addSection('5. Población', `5.1 Criterios de inclusión: ${placeholder(values.population)}. 5.2 Criterios de exclusión: Este apartado debe adaptarse según el tipo de estudio.`);
    addSection('6. Variables', (draftData.variablesSection || ['[Pendiente de completar por el investigador principal]']).join(' '));
    addSection('7. Fuentes de los datos', values.personalData === 'Sí' ? 'Se prevé uso de datos personales o clínicos. Deben detallarse origen, acceso y medidas de anonimización o seudonimización.' : 'Este apartado debe adaptarse según el tipo de estudio.');
    addSection('8. Análisis estadístico', (draftData.analysisPlan || ['[Pendiente de completar por el investigador principal]']).join(' '));
    addSection('9. Etapas y calendario', 'Este apartado debe adaptarse según el tipo de estudio. [Pendiente de completar por el investigador principal]');
    addSection('10. Gestión de los datos y control de calidad', 'Definir procedimientos de verificación, trazabilidad, almacenamiento seguro y revisión metodológica.');
    addSection('11. Limitaciones de los métodos de investigación', (draftData.methodAlerts || ['Este apartado debe adaptarse según el tipo de estudio.']).join(' '));
    addSection('12. Protección de las personas sometidas al estudio', `12.1 Evaluación beneficio/riesgo: ${draftData.ethicsAlerts?.[0] || 'Este apartado debe adaptarse según el tipo de estudio.'} 12.2 Información a los sujetos y consentimiento informado: ${values.vulnerable === 'Sí' ? 'Aplicar salvaguardas reforzadas y lenguaje accesible.' : 'Debe definirse el procedimiento específico.'} 12.3 Confidencialidad de los datos: ${values.personalData === 'Sí' ? 'Obligatorio plan de protección de datos.' : 'Este apartado debe adaptarse según el tipo de estudio.'} 12.4 Interferencias con los hábitos de prescripción, si aplica: Este apartado puede no aplicar según el tipo de estudio.`);
    addSection('13. Gestión y notificación de reacciones adversas, si aplica', 'Este apartado debe adaptarse según el tipo de estudio y puede no aplicar en estudios sin intervención.');
    addSection('14. Plan de trabajo', 'Definir fases, responsables y entregables. [Pendiente de completar por el investigador principal]');
    addSection('15. Planes de difusión y comunicación de resultados', 'Especificar foros de difusión académica, criterios de autoría y estrategia de publicación.');
    addSection('16. Bibliografía', 'Incluir referencias metodológicas y científicas actualizadas según normativa de citación aplicable.');

    addHeaderFooter();
    const filename = `protocolo_investigacion_${dateStr}.pdf`;
    doc.save(filename);
    return filename;
  };
})();
