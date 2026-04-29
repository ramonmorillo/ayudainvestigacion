(function () {
  const NOTE_TEXT = 'Este documento es un borrador orientativo generado como ayuda para el diseño inicial de un proyecto de investigación. No sustituye la revisión metodológica, ética, legal ni la evaluación por el CEI correspondiente. El investigador principal es responsable de revisar, completar, justificar y adaptar el protocolo a la normativa vigente, al centro y al tipo de investigación.';
  const CREDIT = 'Herramienta creada por Ramón Morillo. Abril de 2026.';

  window.generateProtocolPdf = function generateProtocolPdf(values, draftData, readiness) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 16;
    const pageWidth = 210;
    const pageHeight = 297;
    const usableWidth = pageWidth - margin * 2;
    const footerY = pageHeight - 10;
    let y = 18;

    const ensure = (needed = 8) => {
      if (y + needed > footerY - 4) {
        doc.addPage();
        y = 18;
      }
    };

    const writeParagraph = (text, size = 10, gap = 4.8) => {
      doc.setFontSize(size);
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(text, usableWidth);
      ensure(lines.length * gap + 2);
      doc.text(lines, margin, y);
      y += lines.length * gap + 2;
    };

    const writeHeading = (text, size = 12) => {
      ensure(10);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(size);
      doc.text(text, margin, y);
      y += 6;
    };

    const title = readiness.shouldGenerateProtocol ? 'PROTOCOLO DE INVESTIGACIÓN' : 'INFORME DE MADUREZ DEL PROYECTO DE INVESTIGACIÓN';
    writeHeading(title, 16);
    writeParagraph(`AyudaInvestigacion · ${new Date().toISOString().slice(0, 10)}`, 10);
    writeParagraph(CREDIT, 10);
    writeParagraph(`Estado global: ${readiness.status} (${readiness.completion}% de completitud)`, 10);
    writeParagraph(`Título: ${draftData.sections['Título']}`, 10);
    writeParagraph(NOTE_TEXT, 9);

    if (!readiness.shouldGenerateProtocol) {
      writeHeading('Resumen de información disponible', 11);
      writeParagraph(`Pregunta: ${draftData.sections['Pregunta de investigación']}`);
      writeParagraph(`Objetivo principal: ${draftData.sections['Objetivo principal']}`);
      writeParagraph(`Diseño: ${draftData.sections['Diseño del estudio']}`);

      writeHeading('Campos críticos pendientes', 11);
      readiness.pending.forEach((item) => writeParagraph(`- ${item.label}`, 10));

      writeHeading('Recomendaciones para completar la idea', 11);
      writeParagraph('Defina con precisión la población.');
      writeParagraph('Formule el objetivo principal con verbo de acción.');
      writeParagraph('Concrete la variable principal y su forma de medición.');
      writeParagraph('Especifique la fuente de datos.');

      writeHeading('Checklist antes de redactar protocolo', 11);
      draftData.checklist.forEach((item) => writeParagraph(`[ ] ${item}`, 10, 4.5));

      writeHeading('Advertencia', 11);
      writeParagraph('Con la información actual aún no es recomendable presentar el proyecto a CEI/SICEIA.');
    } else {
      Object.entries(draftData.sections).forEach(([sectionTitle, content], index) => {
        writeHeading(`${index + 1}. ${sectionTitle}`, 11);
        writeParagraph(content, 10);
      });

      if (draftData.pendingInfo && draftData.pendingInfo.length) {
        writeHeading('Información pendiente de completar', 11);
        draftData.pendingInfo.forEach((item) => writeParagraph(`- ${item}`, 10));
      }

      writeHeading('Checklist final para el investigador', 11);
      draftData.checklist.forEach((item) => writeParagraph(`[ ] ${item}`, 10, 4.5));
    }

    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i += 1) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(`AyudaInvestigacion · ${CREDIT} · Página ${i}/${pages}`, pageWidth / 2, footerY, { align: 'center' });
    }

    const fileBase = readiness.shouldGenerateProtocol ? 'protocolo_investigacion' : 'informe_madurez_proyecto';
    doc.save(`${fileBase}_${new Date().toISOString().slice(0,10)}.pdf`);
  };
})();
