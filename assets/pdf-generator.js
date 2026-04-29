(function () {
  const NOTE_TEXT = 'Este documento es un borrador orientativo generado como ayuda para el diseño inicial de un proyecto de investigación. No sustituye la revisión metodológica, ética, legal ni la evaluación por el CEI correspondiente. El investigador principal es responsable de revisar, completar, justificar y adaptar el protocolo a la normativa vigente, al centro y al tipo de investigación.';

  window.generateProtocolPdf = function generateProtocolPdf(values, draftData) {
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

    writeHeading('PROTOCOLO DE INVESTIGACIÓN', 16);
    writeParagraph(`AyudaInvestigacion · ${new Date().toISOString().slice(0, 10)}`, 10);
    writeParagraph(`Título: ${draftData.sections['Título']}`, 10);
    writeParagraph(`Investigador principal: ${draftData.sections['Investigador principal']}`, 10);
    writeParagraph(NOTE_TEXT, 9);

    Object.entries(draftData.sections).forEach(([title, content], index) => {
      writeHeading(`${index + 1}. ${title}`, 11);
      writeParagraph(content, 10);
    });

    writeHeading('Checklist final para el investigador', 11);
    draftData.checklist.forEach((item) => writeParagraph(`[ ] ${item}`, 10, 4.5));

    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i += 1) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(`AyudaInvestigacion · Página ${i}/${pages}`, pageWidth / 2, footerY, { align: 'center' });
    }

    doc.save(`protocolo_investigacion_${new Date().toISOString().slice(0,10)}.pdf`);
  };
})();
